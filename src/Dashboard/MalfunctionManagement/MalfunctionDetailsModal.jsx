import { RiCloseLine } from "react-icons/ri";
import { FiXCircle } from "react-icons/fi";

const MalfunctionDetails = ({ malfunction, onClose }) => {
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

  // Helper function to translate status
  const translateStatus = (status) => {
    const translations = {
      Reported: "Signalé",
      "In Progress": "En cours",
      Resolved: "Résolu",
    };
    return translations[status] || status;
  };

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
                <h2 className="text-white text-xl font-bold">Détails de la panne</h2>
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
                <div className="flex w-full flex-col md:flex-row h-full justify-between items-start p-4">
                  <div className="w-full md:w-1/2 pr-4">
                    <h2
                      className="text-xl font-bold mb-4"
                      style={{ color: "var(--color-text)" }}
                    >
                      {malfunction.name}
                    </h2>
                    <div className="space-y-3">
                      <DetailItem label="Type" value={malfunction.type === "vehicle" ? "Véhicule" : "Outil"} />
                      <DetailItem label="Statut" value={translateStatus(malfunction.status)} />
                      <DetailItem label="Déclarée par" value={malfunction.declared_by} />
                      <DetailItem label="Date de déclaration" value={new Date(malfunction.reportedAt).toLocaleDateString()} />
                      <DetailItem label="Heure de déclaration" value={new Date(malfunction.reportedAt).toLocaleTimeString()} />
                    </div>
                  </div>

                  <div className="w-full md:w-1/2 mt-4 md:mt-0">
                    <h3
                      className="text-lg font-semibold mb-2"
                      style={{ color: "var(--color-text)" }}
                    >
                      Description
                    </h3>
                    <p
                      className="p-4 rounded-lg"
                      style={{
                        backgroundColor: "var(--color-mobile-menu-bg)",
                        color: "var(--color-text)",
                      }}
                    >
                      {malfunction.description}
                    </p>
                  </div>
                </div>

                {/* Photos Section */}
                {malfunction.photos && malfunction.photos.length > 0 && (
                  <div className="mt-6">
                    <h3
                      className="text-lg font-semibold mb-4"
                      style={{ color: "var(--color-text)" }}
                    >
                      Photos de la panne
                    </h3>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      {malfunction.photos.map((photo, index) => (
                        <div
                          key={index}
                          className="rounded-lg overflow-hidden"
                          style={{ border: "1px solid var(--color-nav-shadow)" }}
                        >
                          <img
                            src={photo}
                            alt={`Panne ${index + 1}`}
                            className="w-full h-32 object-cover"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Maintenance Information */}
                <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
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
                        malfunction.last_maintenance_date
                          ? new Date(malfunction.last_maintenance_date).toLocaleDateString()
                          : "N/A"
                      }
                    />
                    <DetailItem label="Prochaine inspection" value={"N/A"} /> {/* Assuming no inspection due date for malfunctions */}
                  </div>

                  <div className="space-y-4">
                    <h3
                      className="text-lg font-semibold pb-2"
                      style={{
                        borderBottom: "1px solid var(--color-nav-shadow)",
                        color: "var(--color-text)",
                      }}
                    >
                      Statut du matériel
                    </h3>
                    <div className="flex items-center">
                      <span
                        className="font-medium mr-2"
                        style={{ color: "var(--color-text)" }}
                      >
                        Disponibilité:
                      </span>
                      <span
                        className={`px-3 py-1 rounded-full text-sm ${
                          malfunction.status === "Resolved"
                            ? "bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-100"
                            : malfunction.status === "In Progress"
                            ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-800 dark:text-yellow-100"
                            : "bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100"
                        }`}
                      >
                        {malfunction.status === "Resolved"
                          ? "Hors service"
                          : malfunction.status === "In Progress"
                          ? "En cours"
                          : "Signalé"}
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
                  className="px-4 py-2 rounded-lg flex items-center font-bold bg-white text-bold text-subtext cursor-pointer transition-all duration-300 ease-in-out hover:scale-105"
                  onMouseEnter={(e) => {
                    e.currentTarget.style.boxShadow = "0 4px 8px rgba(0, 198, 255, 0.5)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.boxShadow = "none";
                  }}
                >
                  <FiXCircle className="mr-2" /> Fermer
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default MalfunctionDetails;