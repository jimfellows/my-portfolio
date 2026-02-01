interface Project {
  title: string
  description: string
  href?: string
  imgSrc?: string
}

const projectsData: Project[] = [
  {
    title: 'A Search Engine',
    description: `What if you could look up any information in the world? Webpages, images, videos
    and more. Google has many features to help you find exactly what you're looking
    for.`,
    imgSrc: '/static/images/google.png',
    href: 'https://www.google.com',
  },
  {
    title: 'The Time Machine',
    description: `Imagine being able to travel back in time or to the future. Simple turn the knob
    to the desired date and press "Go". No more worrying about lost keys or
    forgotten headphones with this simple yet affordable solution.`,
    imgSrc: '/static/images/time-machine.jpg',
    href: '/blog/the-time-machine',
  },
  {
    title: 'Rockfish Cutter Camera',
    description: `An overhead camera system developed for NOAA Fisheries to automate biological sampling. Features a Raspberry Pi 4, PoE, FastAPI, and custom EXIF metadata tagging for high-resolution specimen imagery.`,
    imgSrc: '/static/images/projects/rockfish/tablet-cam.jpg',
    href: '/blog/rockfish-camera-system',
  },
  {
    title: 'Data Tender',
    description: `Automated at-sea data submission application using Starlink and AWS S3. Built with PySide6/QML to replace manual sneakernet workflows with real-time cloud data pipelines.`,
    imgSrc: '/static/images/projects/data-tender/main-ui.png',
    href: '/blog/data-tender-starlink-aws',
  },
]

export default projectsData
