export async function onRequest(context) {
  console.log(context)
  const json = {
    data: 'Hello World'
  }
  return new Response(JSON.stringify(json), { headers: { "Content-Type": "application/json" } })
}

