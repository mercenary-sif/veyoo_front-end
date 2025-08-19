const searchFiltter = ({ name, active, onClick }) => {
  return (
    <div className='shrink-0 p-2'>
      <span
        onClick={onClick}
        className={`p-3 w-full rounded-xl text-sm font-semibold cursor-pointer transition-colors duration-300 ${
          active 
            ? 'bg-subtext text-white' 
            : 'bg-gray-100 dark:bg-gray-700 text-black/70 dark:text-gray-300'
        } hover:bg-subtext hover:text-white dark:hover:bg-subtext dark:hover:text-white`}
      >
        {name}
      </span>
    </div>
  )
}

export default searchFiltter