import fetch from 'node-fetch';
import { DateTime } from 'luxon';

const userAgent = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/112.0.0.0 Safari/537.36';

// const Cookie =
//   'X-api.sj.se-session-v19=Iw_kJAWatUk_SiLq2J6RgQt18OV1rF-1XgqPW6UZeLd_eNpjcgzwjA_wNmRmYirO0itOZWYqSKzMyy9L1EvOz2VmZgLBYC_dYFdmJgVmppAgxzBXHx_XIGYmQzMLQ2NzM0tTCwtjY4g6CHQNcwNRaYk5INOYAf1SEoY;X-api.sj.se-service=EnjaY3IM8IwP8DZkZjIxM7VgZjIwYGYKYAYAMMoDoQ';

const headers = {
  'Content-Type': 'application/json',
  'User-Agent': userAgent,
  'x-api.sj.se-language': 'sv',
};

interface Journey {
  journeyToken: string;
  journeyReference: string;
  departureDate: {
    date: string;
  };
  duration: {
    duration: number;
  };
  departureTime: {
    time: string;
  };
  arrivalDate: {
    date: string;
  };
  arrivalTime: {
    time: string;
  };
  departureLocation: {
    name: string;
  };
  arrivalLocation: {
    name: string;
  };
  itineraries: string[];
}

interface Supplier {
  supplier: string;
  supplierData: {
    cookies: { name: string; value: string }[];
  };
}

const getPrice = async (pricingStandardToken: string, journeyToken: string, Cookie: string) => {
  const res = await fetch('https://www.sj.se/v19/rest/travels/prices/' + pricingStandardToken + '/' + journeyToken, {
    headers: {
      ...headers,
      Cookie,
    },
    method: 'GET',
  });
  const json = await res.json();
  return json;
};

const getTimeTable = async (timetableToken: string, pricingStandardToken: string, Cookie: string) => {
  const res = await fetch(
    'https://www.sj.se/v19/rest/travels/timetables/' +
      timetableToken +
      '?buses=true&expressbuses=false&highspeedtrains=true&onlydirectjourneys=false&onlysj=false',
    {
      headers: {
        ...headers,
        Cookie,
      },
      method: 'GET',
    }
  );
  const json = (await res.json()) as {
    journeys: Journey[];
  };
  const prices = await Promise.all(json.journeys.map((journey) => getPrice(pricingStandardToken, journey.journeyToken, Cookie)));
  return {
    journeys: json.journeys,
    prices,
  };
};

const searchData = async (date: string, Cookie: string) => {
  const res = await fetch('https://www.sj.se/v19/rest/travels/searchdata', {
    body: JSON.stringify({
      timetableToken: '',
      departureLocation: {
        id: '00001:074',
        name: 'Stockholm Central',
      },
      arrivalLocation: {
        id: '00009:074',
        name: 'Linköping C',
      },
      journeyDate: {
        date,
      },
      consumers: [
        {
          consumerCategory: {
            id: 'VU',
            name: '',
          },
          personCustomer: {
            id: null,
            personName: null,
          },
          claims: [],
          selectedAge: null,
        },
      ],
      minimumChangeoverTime: {
        days: '0',
        hours: '0',
        minutes: '0',
        duration: null,
      },
      promotionCode: '',
    }),
    headers: {
      ...headers,
      Cookie,
      'x-api.sj.se-language': 'sv',
    },
    method: 'POST',
  });
  const json = await res.json();

  if (json.errors?.length) {
    return {
      journeys: [],
      prices: [],
    };
  }

  const timetable = await getTimeTable(json.timetableToken, json.pricingTokens.STANDARD.token, Cookie);

  return timetable;
};

export const search = async (date: string) => {
  if (!DateTime.fromJSDate(new Date(date)).isValid) {
    return { error: 'Invalid date' };
  }

  const res = await fetch('https://train.api.services.srvc.io/cookie', {
    headers,
    method: 'GET',
  });
  console.log({ res });
  const json = (await res.json()) as {
    suppliers: Supplier[];
  };

  const supplier = json.suppliers.find((supplier) => {
    return supplier.supplier === 'sj';
  });

  const cookies = supplier?.supplierData.cookies;

  const parsedCookies = cookies
    ?.map((cookie) => {
      if (cookie.name === 'X-api.sj.se-service' || cookie.name === 'X-api.sj.se-session-v19') {
        return cookie.name + '=' + cookie.value + ';';
      }
      return null;
    })
    .filter(Boolean)
    .join('');

  if (!parsedCookies) {
    return { error: 'Invalid cookies' };
  }

  const data = await searchData(date, parsedCookies);

  const formattedData = data.journeys.map((journey) => {
    const foundPrice = data.prices.find((price) => price.journeyReference === journey.journeyReference);

    let firstClass = 'Not found';

    if (foundPrice?.salesCategoryPrice) {
      firstClass =
        foundPrice.salesCategoryPrice.SEAT.COMFORT.FIX.journeyPriceDescription &&
        !foundPrice.salesCategoryPrice.SEAT.COMFORT.FIX.journeyPriceDescription.soldOut
          ? foundPrice.salesCategoryPrice.SEAT.COMFORT.FIX.journeyPriceDescription.basePrice.amount +
            ' ' +
            foundPrice.salesCategoryPrice.SEAT.COMFORT.FIX.journeyPriceDescription.basePrice.currency
          : 'Not found';
    }

    return {
      departureDate: journey.departureDate.date,
      departureTime: journey.departureTime.time,
      duration: journey.duration.duration,
      arrivalDate: journey.arrivalDate.date,
      arrivalTime: journey.arrivalTime.time,
      transfers: journey.itineraries.length - 1,
      firstClass,
      link:
        'https://www.sj.se/kop-resa/valj-resa/' +
        journey.departureLocation.name +
        '/' +
        journey.arrivalLocation.name +
        '/' +
        journey.departureDate.date,
    };
  });

  return formattedData;
};
