interface Project {
  title: string
  description: string
  href?: string
  imgSrc?: string
}

const projectsData: Project[] = [
  {
    title: 'Rockfish Cutter Camera',
    description: `An overhead camera system developed for NOAA Fisheries to automate biological sampling. Features a Raspberry Pi 4, PoE, FastAPI, and custom EXIF metadata tagging for high-resolution specimen imagery.`,
    imgSrc: '/static/images/projects/rockfish/fish-detect-json.png',
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
