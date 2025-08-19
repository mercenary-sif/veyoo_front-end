import { IoIosArrowForward } from "react-icons/io";

const Malfunction = ({id, photo, name, status, type, last_maintenance_date, declared_by, onClickDetails }) => {
  return (
    <div className="bg-gray-100 dark:bg-gray-900 rounded-lg overflow-hidden flex flex-col justify-start 
      items-start shadow-xl h-[385px] lg:h-[420px] w-[250px] border border-gray-200 dark:border-gray-700 transition-colors duration-300">
      {/* Photo section */}
      <div className="w-full p-2 overflow-hidden rounded-lg">
        <img
          src={photo}
          alt={`Malfunction ${id}`}
          className="w-full h-44 object-cover rounded-lg"
        />
      </div>
      
      <div className="p-[1rem] flex-1 flex flex-col justify-start items-start w-full">
        {/* Title */}
        <div className="flex justify-between items-center w-full mb-2">
          <h2 className="text-[16px] lg:text-[19px] font-semibold text-gray-900 dark:text-white line-clamp-1">
            {name || `Material #${id}`}
          </h2>
        </div>
        
        {/* Status badges */}
        <div className="flex items-center mb-2 text-[12px] lg:text-[16px] w-full gap-[1rem]">
          <span
            className={`px-2 py-1 rounded-full text-sm font-semibold ${
              status === "under_maintenance"
                ? "bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200"
                : "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-200"
            }`}
          >
            {status.replace("_", " ")}
          </span>
          <span
            className={`px-2 py-1 rounded-full text-sm font-semibold 
                        bg-yellow-100 dark:bg-yellow-900/30 
                        text-blog dark:text-subtext`}
          >
            {type}
          </span>
        </div>
        
        {/* Maintenance date */}
        <p className="text-gray-600 dark:text-gray-300 mb-2 text-[12px] lg:text-[16px]">
          Dernière maintenance: {new Date(last_maintenance_date).toLocaleDateString("en-US")}
        </p>
        
        {/* Declared by */}
        <p className="text-gray-600 dark:text-gray-300 mb-4 text-[12px] lg:text-[16px]">
          Déclaré par: {declared_by}
        </p>
        
        {/* Details button */}
        <button
          onClick={onClickDetails}
          className='flex  justify-center items-center gap-[2px] mt-auto 
                    bg-transparent border-none outline-none 
                    text-gray-600 dark:text-gray-400 
                    hover:text-subtext dark:hover:text-blue-300 
                    cursor-pointer transition-all duration-300 ease-in-out hover:scale-105'
        >
          Voir les détails
          <IoIosArrowForward className="transition-transform duration-300 group-hover:translate-x-1"/>
        </button>
      </div>
    </div>
  )
}

export default Malfunction;