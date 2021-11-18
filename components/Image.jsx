import Image from 'next/image'

const cloudflareImageLoader = ({ src, width, quality }) => {
  if (!quality) {
    quality = 75
  }
  return `https://images.srvcio.workers.dev?width=${width}&quality=${quality}&image=https://srvc.io${src}`
}

export default function Img(props) {
  if (process.env.NODE_ENV === 'development') {
    return <Image unoptimized={true} {...props} />
  } else {
    return <Image {...props} loader={cloudflareImageLoader} />
  }
}