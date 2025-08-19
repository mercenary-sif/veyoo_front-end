import { FaTools } from "react-icons/fa";
import { IoIosArrowForward } from "react-icons/io";
import { ErrorGetData, SectionHeader, Tool } from "../../components/export";
import useVeYooAxios from "../../components/Context/useVeYooAxios";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const Tools = ({ setSelectedTool }) => {
  const navigate = useNavigate();
  const [tools, setTools] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [emptyDataList, setEmptyDataList] = useState(null);

  const VeYooAxios = useVeYooAxios();

  useEffect(() => {
    const controller = new AbortController();

    const fetchTools = async () => {
      setIsLoading(true);
      try {
        const response = await VeYooAxios.get("/material/tools/list-all-tool/", {
          signal: controller.signal,
        });

        if (response.status === 200) {
          const data = response.data;
          const mappedTools = (data.tools || []).map((tool) => ({
            ...tool,
            photo: tool.photo_base64 ? `data:image/jpeg;base64,${tool.photo_base64}` : null,
            is_active: tool.reservation_status === "available", // Corrected: true only for available tools
            status: tool.status, // Direct mapping from material.status
            created_at: tool.created_at || null,
            updated_at: tool.updated_at || null,
            last_maintenance_date: tool.last_maintenance_date || null,
            inspection_due_date: tool.inspection_due_date || null,
          }));
          setTools(mappedTools);
          setError(null);
          setEmptyDataList(null);
        } else if (response.status === 404) {
          setEmptyDataList("Aucun outil trouvé");
        } else {
          setError("Erreur lors de la récupération des outils");
        }
      } catch (err) {
        if (err.name === "CanceledError") {
          return;
        }

        if (err.response && err.response.status === 404) {
          setEmptyDataList("Aucun outil trouvé");
        } else if (err.request) {
          setError("Erreur de connexion au serveur");
        } else {
          setError("Une erreur est survenue");
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchTools();

    return () => {
      try {
        controller.abort();
      } catch (e) {}
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="flex flex-col  justify-center items-center p-[2rem] lg:p-[4rem] gap-[2rem]">
      <SectionHeader title={"L'équipement"} Icon={FaTools} />
      <div className="space-y-6 w-full ">
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
              {tools.slice(0, 4).map((item, i) => (
                <Tool
                  key={i}
                  id={i}
                  photo={item.photo}
                  status={item.status}
                  name={item.name}
                  updated_at={item.updated_at}
                  created_at={item.created_at}
                  last_maintenance_date={item.last_maintenance_date}
                  inspection_due_date={item.inspection_due_date}
                  is_Active={item.is_active}
                  onClickDetails={() => setSelectedTool(item)}
                />
              ))}
            </div>
            <div className="flex w-full justify-end items-center">
              <button
                onClick={() => navigate("/équipement")}
                className="flex justify-center items-center gap-[2px] mt-auto bg-transparent border-none outline-none text-gray-600 dark:text-gray-400 hover:text-subtext dark:hover:text-blue-300 cursor-pointer transition-all duration-300 ease-in-out hover:scale-105"
              >
                Voir tous l'équipement
                <IoIosArrowForward />
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Tools;