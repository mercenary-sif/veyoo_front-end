import { RiCloseLine } from "react-icons/ri";
import { FiXCircle } from "react-icons/fi";

const ToolDetails = ({ tool, onClose }) => {
  // Helper component for detail items
  const DetailItem = ({ label, value }) => (
    <div className="flex">
      <span
        className="font-medium w-48"
        style={{ color: "var(--color-text)", opacity: 0.8 }}
      >
        {label}:
      </span>
      <span style={{ color: "var(--color-text)" }}>{value}</span>
    </div>
  );
  return (
    <>
      {/* Backdrop with blur effect */}
      <div
        className="fixed inset-0 bg-black/20 backdrop-blur-sm z-0"
        style={{ height: "100%", minHeight: "100vh" }}
      />

      <div className="fixed inset-0 h-full z-50 flex items-center justify-center p-2 overflow-y-auto">
        <div className="relative w-full h-full">
          <div className="min-h-full flex items-center justify-center p-2">
            {/* Modal content */}
            <div
              className="relative w-full max-w-screen-lg rounded-xl shadow-xl z-1 flex flex-col"
              style={{
                backgroundColor: "var(--color-nav-bg)",
                color: "var(--color-text)",
              }}
            >
              {/* Header */}
              <div
                className="p-4 flex justify-between items-center rounded-t-xl"
                style={{ backgroundColor: "var(--color-subtext)" }}
              >
                <h2 className="text-white text-xl font-bold">{tool.name}</h2>
                <button
                  onClick={onClose}
                  className="text-white hover:text-gray-200 text-2xl"
                >
                  <RiCloseLine
                    size={25}
                    className="hover:text-[var(--color-blog)] cursor-pointer transition-colors duration-300"
                  />
                </button>
              </div>

              {/* Body */}
              <div className="flex-grow overflow-y-auto p-6">
                <div className="flex w-full flex-col md:flex-row h-full lg:h-[300px] justify-between items-center p-[2rem] lg:p-2">
                  <div className="flex justify-start items-center w-[360px] lg:w-[450px] h-full">
                    <img
                      src={tool.photo}
                      className="w-full h-full object-contain"
                      alt="Tool"
                    />
                  </div>
                  <div className="flex flex-col justify-center items-center flex-1 h-full p-3">
                    <h2
                      className="text-[16px] md:text-[22px] lg:text-[26px] text-center font-bold mb-4"
                      style={{ color: "var(--color-text)" }}
                    >
                      {tool.name}
                    </h2>
                    <span className={`px-3 py-1 rounded-full text-sm ${
                      tool.status === "good"
                        ? "bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100"
                        : tool.status === "under_maintenance"
                        ? "bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-100"
                        : "bg-yellow-100 text-yellow-800 dark:bg-yellow-800 dark:text-yellow-100"
                    }`}>
                      {tool.status === "good"
                        ? "Bon état"
                        : tool.status === "under_maintenance"
                        ? "En maintenance"
                        : "En attente de maintenance"}
                    </span>
                  </div>
                </div>

                <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Tool Information */}
                  <div className="space-y-4">
                    <h3
                      className="text-lg font-semibold pb-2"
                      style={{
                        borderBottom: "1px solid var(--color-nav-shadow)",
                        color: "var(--color-text)",
                      }}
                    >
                      Informations de l'outil
                    </h3>
                    <DetailItem label="Type" value="Outil" /> {/* Assuming all are tools */}
                    <DetailItem label="ID" value={tool.id.toString()} />
                    <DetailItem
                      label="Date de création"
                      value={new Date(tool.created_at).toLocaleDateString()}
                    />
                    <DetailItem
                      label="Dernière mise à jour"
                      value={new Date(tool.updated_at).toLocaleDateString()}
                    />
                  </div>

                  {/* Maintenance Information */}
                  <div className="space-y-4">
                    <h3
                      className="text-lg font-semibold pb-2"
                      style={{
                        borderBottom: "1px solid var(--color-nav-shadow)",
                        color: "var(--color-text)",
                      }}
                    >
                      Maintenance
                    </h3>
                    <DetailItem
                      label="Dernière maintenance"
                      value={
                        tool.last_maintenance_date
                          ? new Date(tool.last_maintenance_date).toLocaleDateString()
                          : "N/A"
                      }
                    />
                    <DetailItem
                      label="Prochaine inspection"
                      value={
                        tool.inspection_due_date
                          ? new Date(tool.inspection_due_date).toLocaleDateString()
                          : "N/A"
                      }
                    />
                  </div>

                  {/* Status Summary */}
                  <div className="space-y-4">
                    <h3
                      className="text-lg font-semibold pb-2"
                      style={{
                        borderBottom: "1px solid var(--color-nav-shadow)",
                        color: "var(--color-text)",
                      }}
                    >
                      Statut
                    </h3>
                    <div className="flex items-center">
                      <span className="font-medium mr-2" style={{ color: "var(--color-text)" }}>
                        Disponibilité:
                      </span>
                      <span className={`px-3 py-1 rounded-full text-sm ${
                        tool.is_active
                          ? "bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100"
                          : "bg-blue-100 text-blue-800 dark:bg-blue-800 dark:text-blue-100"
                      }`}>
                        {tool.is_NotActive ? "Disponible" : "Réservé"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div
                className="px-6 py-4 flex justify-end rounded-b-xl"
                style={{ backgroundColor: "var(--color-subtext)" }}
              >
                <button
                  onClick={onClose}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.boxShadow = "0 4px 8px rgba(0, 198, 255, 0.5)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.boxShadow = "none";
                  }}
                  className={`px-4 py-2 flex items-center font-bold text-bold rounded-md transition-all duration-300 ease-in-out hover:scale-105 ${
                   "bg-gray-300 text-black hover:bg-gray-200"   
                  }`}
                >
                  { <FiXCircle className="mr-2" /> }
                  { "Fermer"}
                </button>
                {/* <button
                  onClick={!tool.is_NotActive && onClose}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.boxShadow = "0 4px 8px rgba(0, 198, 255, 0.5)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.boxShadow = "none";
                  }}
                  className={`px-4 py-2 flex items-center font-bold text-bold rounded-md transition-all duration-300 ease-in-out hover:scale-105 ${
                    tool.is_NotActive
                      ?   "bg-green-500 text-gray-100 hover:bg-green-600" 
                      : "bg-gray-300 text-black hover:bg-gray-200"
                     
                  }`}
                >
                  {tool.is_NotActive ? <FiCheckCircle className="mr-2" /> : <FiXCircle className="mr-2" /> }
                  {tool.is_NotActive ?  "Réservé" : "Fermer"}
                </button> */}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ToolDetails;