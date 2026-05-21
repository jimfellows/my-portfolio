interface Props {
  text: string
}

const Tag = ({ text }: Props) => {
  return (
    <span
      className="text-primary-500 mr-3 text-sm font-medium uppercase"
    >
      {text.split(' ').join('-')}
    </span>
  )
}

export default Tag
