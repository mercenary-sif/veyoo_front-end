const S_Header = ({title, Icon}) => {
  return (
    <div className="flex w-full justify-start items-center gap-[1rem]">
      <Icon 
        className="text-[26px] md:text-[28px] lg:text-[40px] cursor-pointer transition-colors duration-300"
        style={{ color: 'var(--color-subtext)' }}
      />
      <h1 
        className="text-[26px] md:text-[28px] lg:text-[40px] font-semibold cursor-pointer transition-colors duration-300"
        style={{ color: 'var(--color-subtext)' }}
      > 
        {title} 
      </h1>
    </div>
  )
}

export default S_Header