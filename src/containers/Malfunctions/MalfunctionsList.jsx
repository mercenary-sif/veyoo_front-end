import { useState, useEffect } from "react";
import { ErrorGetData, Malfunction, Search, SearchFilter } from "../../components/export";
import useVeYooAxios from "../../components/Context/useVeYooAxios";

const MalfunctionsList = ({ setSelectedMalfunction }) => {
  const [activeFilter, setActiveFilter] = useState("all");
  const [malfunctions, setMalfunctions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [emptyDataList, setEmptyDataList] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [emptySearchList, setSearchDataList] = useState(null);
  const VeYooAxios = useVeYooAxios();

  useEffect(() => {
  const fetchData = async () => {
    setIsLoading(true);
    try {
      const malfunctionsResponse = await VeYooAxios.get("/material/malfunctions/all-list/");
      if (malfunctionsResponse.status === 200) {
        const data = malfunctionsResponse.data || {};

        const mappedMalfunctions = (data.materials || []).flatMap((material) => {
          // material type normalization (vehicle/tool)
          const matTypeRaw = String(material.type || '').toLowerCase();
          const type = (matTypeRaw.includes('veh') || matTypeRaw === 'vehicle' || matTypeRaw === 'véhicule' || matTypeRaw === 'vehicule')
            ? 'vehicle'
            : 'tool';

          // material.photo may be base64 (no prefix), a full data URI, or null
          const materialPhotoRaw = material.photo ?? null;
          const materialPhoto = materialPhotoRaw
            ? (typeof materialPhotoRaw === 'string' && materialPhotoRaw.startsWith('data:')
                ? materialPhotoRaw
                : `data:image/jpeg;base64,${materialPhotoRaw}`)
            : null;

          // build a mapped array for each malfunction of this material
          return (material.malfunctions || []).map((malfunction) => {
            // malfunction.photos may be null or an array of base64 strings (no prefix)
            const photosRaw = malfunction.photos ?? [];
            const photos = Array.isArray(photosRaw)
              ? photosRaw.map((p) => (typeof p === 'string' && p.startsWith('data:') ? p : `data:image/jpeg;base64,${p}`))
              : [];

            // normalize reportedBy (could be a string or an object)
            const reportedBy =
              typeof malfunction.reported_by === 'string'
                ? malfunction.reported_by
                : (malfunction.reported_by?.username || malfunction.reported_by?.name || '');

            return {
              id: malfunction.id,
              name: material.name,
              type, // 'vehicle' or 'tool'
              materialId: material.id,
              materialStatus: material.status,
              status: malfunction.status,
              reportedBy,
              reportedAt: malfunction.created_at,
              description: malfunction.description,
              notes: malfunction.notes,
              photos,                 // array (possibly empty) of malfunction photos (data URIs)
              last_maintenance_date: material.last_maintenance_date || null,
              inspection_due_date: material.inspection_due_date || null,
              declared_by: reportedBy,
              materialPhoto,          // the material's own photo (data URI) or null
              photo: materialPhoto || (photos.length > 0 ? photos[0] : null) // back-compat: primary photo
            };
          });
        });

        setMalfunctions(mappedMalfunctions);

        setEmptyDataList(null);
        setError(null);
      } else if (malfunctionsResponse.status === 404) {
        setEmptyDataList(malfunctionsResponse.data?.message || 'Aucune donnée trouvée');
        
      } else {
        setError("Erreur lors de la récupération des dysfonctionnements");
      }
    } catch (err) {
      if (err.response && err.response.status === 404) {
        setEmptyDataList(err.response.data?.message || 'Aucune donnée trouvée');
        
      } else if (err.request) {
        setError("Erreur de connexion au serveur");
      } else {
        setError("Une erreur est survenue");
      }
    } finally {
      setIsLoading(false);
    }
  };

  fetchData();
  // eslint-disable-next-line react-hooks/exhaustive-deps
}, []);
  //     REPORTED     = 'Reported',     _('Signalé')
  //   IN_PROGRESS  = 'In Progress',  _('En cours')
  //   RESOLVED     = 'Resolved',     _('Résolu')
  // // Filter logic based on status
  const filteredMalfunctions = malfunctions.filter((malfunction) => {
    const matchesFilter =
      activeFilter === "all" ||
      (activeFilter === "Résolu" && malfunction.status === "Resolved") ||
      (activeFilter === "hors service" && malfunction.status === "Reported") ||
      (activeFilter === "maintenance en cours" && malfunction.status === "In Progress");
    const matchesSearch = malfunction.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });
  useEffect(() => {
    if (filteredMalfunctions.length === 0 && searchQuery && !isLoading && !error) {
      setSearchDataList("Aucun matériel de dysfonctionnement trouvé pour cette recherche");
    } else if (filteredMalfunctions.length > 0 || !searchQuery) {
      setSearchDataList(null);
    }
  }, [filteredMalfunctions, searchQuery ,isLoading ,error]);
  const filterList = ["all", "hors service", "maintenance en cours" , "Résolu"];

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
           <div className="flex flex-col md:flex-wrap md:flex-row w-full justify-start px-2 lg:px-[2rem] items-center gap-[2rem]">
            {filteredMalfunctions.map((item, i) => (
              <Malfunction
                key={i}
                id={i}
                photo={item.photo || null} // Use first photo if available
                status={item.status}
                name={item.name}
                last_maintenance_date={item.last_maintenance_date}
                declared_by={item.reportedBy}
                type={item.type}
                onClickDetails={() => setSelectedMalfunction(item)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MalfunctionsList;