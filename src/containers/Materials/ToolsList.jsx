import { useState, useEffect } from "react";
import { ErrorGetData, Search, SearchFilter, Tool } from "../../components/export";
import useVeYooAxios from "../../components/Context/useVeYooAxios";

const ToolsList = ({ setSelectedTool }) => {
  const [activeFilter, setActiveFilter] = useState("all");
  const [tools, setTools] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [emptyDataList, setEmptyDataList] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [emptySearchList, setSearchDataList] = useState(null);
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
            is_NotActive: (tool.reservation_status.toLowerCase()  === "available" && tool.status.toLowerCase() ==='good'), // Corrected: true only for available tools
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
          setError("Erreur lors de la récupération des données");
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

  // Filter logic based on status and reservation status
  const filteredTools = tools.filter((tool) => {
    const matchesFilter =
      activeFilter === "all" ||
      (activeFilter === "bon" && tool.status === "good") ||
      (activeFilter === "hors service" && tool.reservation_status === "not_available") ||
      (activeFilter === "maintenance en cours" && tool.status === "under_maintenance") ||
       (activeFilter === "Maintenance en attente" && tool.status === "pending_maintenance") ||
      (activeFilter === "Réservé" && tool.reservation_status === "reserved") ||
      (activeFilter === "Disponible" && tool.reservation_status === "available");
    const matchesSearch = tool.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });
    // Set emptyDataList if filtered list is empty after search
  useEffect(() => {
    if (filteredTools.length === 0 && searchQuery && !isLoading && !error) {
      setSearchDataList("Aucun outil trouvé pour cette recherche");
    } else if (filteredTools.length > 0 || !searchQuery) {
      setSearchDataList(null);
    }
  }, [filteredTools, searchQuery, isLoading, error]);

  const filterList = ["all", "bon", "hors service","Maintenance en attente" , "maintenance en cours", "Réservé", "Disponible" ];

  return (
    <div className="flex flex-col justify-start items-center lg:py-[2rem] p-[1rem] lg:px-[4rem] lg:gap-[2rem] gap-3">
      <div className="px-[2rem] w-full">
        <Search onSearch={setSearchQuery} />
      </div>
      <div className="flex justify-start items-center w-full px-2 lg:px-[2rem] gap-1 overflow-x-auto whitespace-nowrap no-scrollbar">
        {filterList.map((item, index) => (
          <SearchFilter
            key={index}
            name={item}
            active={activeFilter === item}
            onClick={() => setActiveFilter(item)}
          />
        ))}
      </div>
      <div className="space-y-6  w-full">
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
          <div className="flex flex-col  md:flex-wrap md:flex-row w-full justify-start px-2 lg:px-[2rem] items-center gap-[2rem]">
            {filteredTools.map((item, i) => (
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
                is_NotActive={item.is_NotActive}
                onClickDetails={() => setSelectedTool(item)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ToolsList;