import { IoIosArrowForward } from "react-icons/io";

const Vehicle = ({
  id,
  is_Active,
  photo,
  status,
  license_plate,
  model,
  name,
  year_of_manufacture,
  current_mileage,
  fuel_level,
  last_maintenance_date,
  inspection_due_date,
  onClickDetails
}) => {
  return (
    <div className="bg-nav rounded-lg overflow-hidden flex flex-col justify-start 
     items-start shadow-xl h-[525px] w-[285px] lg:h-[575px] lg:w-[350px] border border-gray-200 dark:border-gray-700">
      <div className="w-full p-2 overflow-hidden rounded-lg">
        <img
          src={photo}
          alt={`${name} ${model}`}
          className="w-full h-48 object-cover rounded-lg"
        />
      </div>
     
      <div className="p-[2rem] flex-1 flex flex-col justify-start items-start">
        <h2 className="text-[16px] lg:text-[19px] font-bold text-gray-900 dark:text-white mb-2 line-clamp-1">
          {name} {model}
        </h2>
        <p className="text-gray-600 dark:text-gray-400 mb-2 text-[12px] lg:text-[16px]">
          Année de fabrication: {year_of_manufacture}
        </p>
        <p className="text-gray-600 dark:text-gray-400 mb-2 line-clamp-1 text-[12px] lg:text-[16px]">
          Plaque d'immatriculation: {license_plate}
        </p>
        <div className="flex items-center mb-2 text-[12px] lg:text-[16px] w-full gap-[1rem]">
          <span
            className={`px-2 py-1 rounded-full text-sm font-semibold ${
              status === "good"
                ? "bg-green-100 text-green-800"
                : status === "under_maintenance"
                ? "bg-red-100 text-red-800"
                : "bg-yellow-100 text-yellow-800"
            }`}
          >
            {status.replace("_", " ")}
          </span>
         {status === "bon" && (
          <span
            className={`px-2 py-1 rounded-full text-sm font-semibold ${
              is_Active  ? "bg-green-100 text-green-800"
                :  "bg-yellow-100 text-blog"
            }`}
          >
            {is_Active  ? 'Réservé' : 'Disponible'}
          </span>
         )}
        </div>
        <p className="text-gray-600 dark:text-gray-400 mb-2 text-[12px] lg:text-[16px]">
          Kilométrage: {current_mileage} km
        </p>
        <p className="text-gray-600 dark:text-gray-400 mb-2 text-[12px] lg:text-[16px]">
          Niveau de carburant: {fuel_level}%
        </p>
        <p className="text-gray-600 dark:text-gray-400 mb-2 text-[12px] lg:text-[16px]">
          Dernière maintenance: {new Date(last_maintenance_date).toLocaleDateString("en-US")}
        </p>
        <p className="text-gray-600 dark:text-gray-400 mb-4 text-[12px] lg:text-[16px]">
         Inspection Due: {new Date(inspection_due_date).toLocaleDateString("en-US")}
        </p>
       <button
          onClick={onClickDetails}
          className='flex justify-center items-center gap-[2px] mt-auto 
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

export default Vehicle;