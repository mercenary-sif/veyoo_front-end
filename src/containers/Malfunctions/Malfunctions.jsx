import { BsTools } from "react-icons/bs";
import { IoIosArrowForward } from "react-icons/io";
import { ErrorGetData, Malfunction, SectionHeader } from "../../components/export";
import useVeYooAxios from "../../components/Context/useVeYooAxios";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const Malfunctions = ({ setSelectedMalfunction }) => {
  const navigate = useNavigate();
  const [malfunctions, setMalfunctions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [emptyDataList, setEmptyDataList] = useState(null);

  const VeYooAxios = useVeYooAxios();

  useEffect(() => {
    const controller = new AbortController();

    const fetchMalfunctions = async () => {
      setIsLoading(true);
      try {
        const response = await VeYooAxios.get("/material/malfunctions/all-list/", {
          signal: controller.signal,
        });

        if (response.status === 200) {
          const data = response.data;
          const mappedMalfunctions = data.materials.flatMap((material) =>
            material.malfunctions.map((malfunction) => ({
              id: malfunction.id,
              name: material.name,
              type: material.type.toLowerCase() === "véhicule" ? "vehicle" : "tool",
              materialId: material.id,
              materialStatus: material.status,
              status: malfunction.status,
              reportedBy: malfunction.reported_by,
              reportedAt: malfunction.created_at,
              description: malfunction.description,
              notes: malfunction.notes,
              photos: malfunction.photos.map((photo) => `data:image/jpeg;base64,${photo}`), // Assuming base64 format
              last_maintenance_date: material.last_maintenance_date || null,
              declared_by: malfunction.reported_by,
            }))
          );
          setMalfunctions(mappedMalfunctions);
          setError(null);
          setEmptyDataList(null);
        } else if (response.status === 404) {
          setEmptyDataList("Aucune panne trouvée");
        } else {
          setError("Erreur lors de la récupération des pannes");
        }
      } catch (err) {
        if (err.name === "CanceledError") {
          return;
        }

        if (err.response && err.response.status === 404) {
          setEmptyDataList("Aucune panne trouvée");
        } else if (err.request) {
          setError("Erreur de connexion au serveur");
        } else {
          setError("Une erreur est survenue");
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchMalfunctions();

    return () => {
      try {
        controller.abort();
      } catch (e) {}
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="flex flex-col justify-center items-center p-[2rem] lg:p-[4rem] gap-[2rem]">
      <SectionHeader title={"Pannes"} Icon={BsTools} />
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
          <>
            <div className="flex flex-col md:flex-wrap md:flex-row w-full justify-start items-center gap-[2rem]">
              {malfunctions.slice(0, 4).map((item, i) => (
                <Malfunction
                  key={i}
                  id={i}
                  photo={item.photos[0] || null} // Use first photo if available
                  status={item.status}
                  name={item.name}
                  last_maintenance_date={item.last_maintenance_date}
                  declared_by={item.reportedBy}
                  type={item.type}
                  onClickDetails={() => setSelectedMalfunction(item)}
                />
              ))}
            </div>
            <div className="flex w-full justify-end items-center">
              <button
                onClick={() => navigate("/pannes")}
                className="flex justify-center items-center gap-[2px] mt-auto bg-transparent border-none outline-none text-gray-600 dark:text-gray-400 hover:text-subtext dark:hover:text-blue-300 cursor-pointer transition-all duration-300 ease-in-out hover:scale-105"
              >
                Voir les Pannes
                <IoIosArrowForward />
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Malfunctions;