import { FaCar } from "react-icons/fa";
import { IoIosArrowForward } from "react-icons/io";
import { ErrorGetData, SectionHeader, Vehicle } from "../../components/export";
import useVeYooAxios from "../../components/Context/useVeYooAxios";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const Vehicles = ({ setSelectedVehicle }) => {
  const navigate = useNavigate();
  const [vehicles, setVehicles] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [emptyDataList, setEmptyDataList] = useState(null);

  const VeYooAxios = useVeYooAxios();

  useEffect(() => {
    const controller = new AbortController();

    const fetchVehicles = async () => {
      setIsLoading(true);
      try {
        const response = await VeYooAxios.get("/material/vehicles/list-all-vehicles/", {
          signal: controller.signal,
        });

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
          setError(null);
          setEmptyDataList(null);
        } else if (response.status === 404) {
          setEmptyDataList("Aucun véhicule trouvé");
        } else {
          setError("Erreur lors de la récupération des véhicules");
        }
      } catch (err) {
        if (err.name === "CanceledError") {
          return;
        }

        if (err.response && err.response.status === 404) {
          setEmptyDataList("Aucun véhicule trouvé");
        } else if (err.request) {
          setError("Erreur de connexion au serveur");
        } else {
          setError("Une erreur est survenue");
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchVehicles();

    return () => {
      try {
        controller.abort();
      } catch (e) {}
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="flex flex-col justify-center items-center p-[2rem] lg:p-[4rem] gap-[2rem]">
      <SectionHeader title={"Véhicules"} Icon={FaCar} />
      <div className="space-y-6 w-full">
        {isLoading ? (
          <div className="flex justify-center py-10">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) :error ? (
         <ErrorGetData error={error} />
        ) : emptyDataList ? (
          <ErrorGetData error={emptyDataList} />
        ) : (
          <>
            <div className="flex flex-col md:flex-wrap md:flex-row w-full justify-start items-center gap-[2rem]">
              {vehicles.slice(0, 3).map((item, i) => (
                <Vehicle
                  key={i}
                  onClickDetails={() => setSelectedVehicle(item)}
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
                />
              ))}
            </div>
            <div className="flex w-full justify-end items-center">
              <button
                onClick={() => navigate("/vehicles")}
                className="flex justify-center items-center gap-[2px] mt-auto bg-transparent border-none outline-none text-gray-600 dark:text-gray-400 hover:text-subtext dark:hover:text-blue-300 cursor-pointer transition-all duration-300 ease-in-out hover:scale-105"
              >
                Voir tous véhicules
                <IoIosArrowForward />
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Vehicles;