import { useState, useEffect } from "react";
import { ErrorGetData, Search, SearchFilter, Vehicle } from "../../components/export";
import useVeYooAxios from "../../components/Context/useVeYooAxios";

const VehiculsList = ({ setSelectedVehicle }) => {
  const [activeFilter, setActiveFilter] = useState("all");
  const [vehicles, setVehicles] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [emptyDataList, setEmptyDataList] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [emptySearchList, setSearchDataList] = useState(null);
  const VeYooAxios = useVeYooAxios();

  useEffect(() => {
    const fetchVehicles = async () => {
      setIsLoading(true);
      try {
        const response = await VeYooAxios.get("/material/vehicles/list-all-vehicles/");
        if (response.status === 200) {
          const data = response.data;
          const mappedVehicles = data.vehicles.map((vehicle) => ({
            ...vehicle,
            fuelType: vehicle.fuel_type,
            photo: vehicle.photo_base64 ? `data:image/jpeg;base64,${vehicle.photo_base64}` : null,
            is_Active: vehicle.reservation_status === "reserved", // Map reservation status to is_Active
            status: vehicle.status, // Map material status directly
          }));
          setVehicles(mappedVehicles);
        } else if (response.status === 404) {
          setEmptyDataList("Aucun véhicule trouvé");
        } else {
          setError("Erreur lors de la récupération des données");
        }
      } catch (error) {
        if (error.response && error.response.status === 404) {
          setEmptyDataList("Aucun véhicule trouvé");
        } else if (error.request) {
          setError("Erreur de connexion au serveur");
        } else {
          setError("Une erreur est survenue");
        }
      } finally {
        setIsLoading(false);
      }
    };
    fetchVehicles();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Filter logic based on status, reservation status, and search query
  const filteredVehicles = vehicles.filter((vehicle) => {
    const matchesFilter =
      activeFilter === "all" ||
      (activeFilter === "bon" && vehicle.status === "good") ||
      (activeFilter === "hors service" && vehicle.reservation_status === "not_available") ||
       (activeFilter === "Maintenance en attente" && vehicle.status === "pending_maintenance") ||
      (activeFilter === "maintenance en cours" && vehicle.status === "under_maintenance") ||
      (activeFilter === "Réservé" && vehicle.reservation_status === "reserved") ||
      (activeFilter === "Disponible" && vehicle.reservation_status === "available");
    const matchesSearch = vehicle.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  // Set emptyDataList if filtered list is empty after search
  useEffect(() => {
    if (filteredVehicles.length === 0 && searchQuery && !isLoading && !error) {
      setSearchDataList("Aucun véhicule trouvé pour cette recherche");
    } else if (filteredVehicles.length > 0 || !searchQuery) {
      setSearchDataList(null);
    }
  }, [filteredVehicles, searchQuery, isLoading, error]);

  const filterList = [
    "all",
    "bon",
    "hors service",
    "Maintenance en attente",
    "maintenance en cours",
    "Réservé",
    "Disponible",
  ];

  return (
    <div className="flex flex-col justify-start items-center lg:py-[2rem] p-[1rem] lg:px-[4rem] lg:gap-[2rem] gap-3">
      <div className="px-[2rem] w-full">
        <Search onSearch={setSearchQuery} />
      </div>
      <div className="flex justify-start items-center w-full px-2 lg:px-[2rem] gap-1 overflow-x-auto whitespace-nowrap no-scrollbar">
        {filterList.map((item, index) => (
          <SearchFilter key={index} name={item} active={activeFilter === item} onClick={() => setActiveFilter(item)} />
        ))}
      </div>
      <div className="space-y-6 w-full">
        {isLoading ? (
          <div className="flex justify-center py-10">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : error ? (
          <ErrorGetData error={error} />
        ) : emptyDataList ? (
          <ErrorGetData error={emptyDataList} />
        ) : (
           emptySearchList ?
           <ErrorGetData error={emptySearchList} />
           :
          <div className="flex flex-col md:flex-wrap md:flex-row w-full justify-start items-center gap-[2rem] px-2 lg:px-[2rem]">
            {filteredVehicles.map((item, i) => (
              <Vehicle
                key={i}
                id={i}
                photo={item.photo}
                status={item.status}
                license_plate={item.license_plate}
                model={item.model}
                name={item.name}
                year_of_manufacture={item.year_of_manufacture}
                current_mileage={item.current_mileage}
                fuel_level={item.fuel_level}
                last_maintenance_date={item.last_maintenance_date}
                inspection_due_date={item.inspection_due_date}
                is_Active={item.is_Active}
                onClickDetails={() => setSelectedVehicle(item)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default VehiculsList;