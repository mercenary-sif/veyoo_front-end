import { RiCloseLine } from "react-icons/ri";
import { FiXCircle } from "react-icons/fi";

const VehicleDetails = ({ vehicle, onClose }) => {
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
                <h2
                  className="text-[16px] md:text-[22px] lg:text-[26px] text-center font-bold"
                  style={{ color: "white" }}
                >
                  {vehicle.name}
                </h2>
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
                      src={vehicle.photo}
                      className="w-full h-full object-fill"
                      alt="the vehicle cover"
                    />
                  </div>
                  <div className="flex justify-center items-center flex-1 h-full p-3">
                    <h2
                      className="text-[16px] md:text-[22px] lg:text-[26px] text-center font-bold"
                      style={{ color: "var(--color-text)" }}
                    >
                      {vehicle.name} {vehicle.model}
                    </h2>
                  </div>
                </div>

                <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Vehicle Information */}
                  <div className="space-y-4">
                    <h3
                      className="text-lg font-semibold pb-2"
                      style={{
                        borderBottom: "1px solid var(--color-nav-shadow)",
                        color: "var(--color-text)",
                      }}
                    >
                      Informations du véhicule
                    </h3>
                    <DetailItem label="Plaque d'immatriculation" value={vehicle.license_plate} />
                    <DetailItem label="Année de fabrication" value={vehicle.year_of_manufacture.toString()} />
                    <DetailItem label="Kilométrage" value={`${vehicle.current_mileage.toLocaleString()} km`} />
                  </div>

                  {/* Status Indicators */}
                  <div className="space-y-4">
                    <h3
                      className="text-lg font-semibold pb-2"
                      style={{
                        borderBottom: "1px solid var(--color-nav-shadow)",
                        color: "var(--color-text)",
                      }}
                    >
                      État du véhicule
                    </h3>
                    <DetailItem label="Niveau de carburant" value={`${vehicle.fuel_level}%`} />
                    {vehicle.oil_level && <DetailItem label="Niveau d'huile" value={`${vehicle.oil_level}%`} />}
                    <DetailItem label="État des pneus" value={vehicle.tire_status} />
                    <DetailItem label="Carrosserie" value={vehicle.body_condition} />
                    <DetailItem label="Moteur" value={vehicle.engine_status} />
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
                    <DetailItem label="Dernière maintenance" value={new Date(vehicle.last_maintenance_date).toLocaleDateString()} />
                    <DetailItem label="Prochaine inspection" value={new Date(vehicle.inspection_due_date).toLocaleDateString()} />
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
                      Statut global
                    </h3>
                    <div className="flex items-center">
                      <span className="font-medium mr-2" style={{ color: "var(--color-text)" }}>
                        Statut:
                      </span>
                      <span className={`px-3 py-1 rounded-full text-sm ${
                        vehicle.status === "good"
                          ? "bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100"
                          : vehicle.status === "under_maintenance"
                          ? "bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-100"
                          : "bg-yellow-100 text-yellow-800 dark:bg-yellow-800 dark:text-yellow-100"
                      }`}>
                        {vehicle.status === "good"
                          ? "Bon état"
                          : vehicle.status === "under_maintenance"
                          ? "En maintenance"
                          : "En attente de maintenance"}
                      </span>
                    </div>
                    <div className="flex items-center">
                      <span className="font-medium mr-2" style={{ color: "var(--color-text)" }}>
                        Disponibilité:
                      </span>
                      <span className={`px-3 py-1 rounded-full text-sm ${
                        vehicle.reservation_status === "reserved"
                          ? "bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100"
                          : vehicle.reservation_status === "available"
                          ? "bg-blue-100 text-blue-800 dark:bg-blue-800 dark:text-blue-100"
                          : "bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-100"
                      }`}>
                        {vehicle.reservation_status === "reserved"
                          ? "Réservé"
                          : vehicle.reservation_status === "available"
                          ? "Disponible"
                          : "Hors service"}
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
                  className={`px-4 py-2 rounded-md flex items-center font-bold transition-all duration-300 ease-in-out hover:scale-105 ${
                      "bg-white text-subtext hover:bg-gray-200"
                  }`}
                >
                  {(
                    <FiXCircle className="mr-2" />
                  ) }
                  {"Fermer"}
                </button>
                {/* <button
                  onClick={onClose}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.boxShadow = "0 4px 8px rgba(0, 198, 255, 0.5)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.boxShadow = "none";
                  }}
                  className={`px-4 py-2 rounded-md flex items-center font-bold transition-all duration-300 ease-in-out hover:scale-105 ${
                    vehicle.reservation_status ===  "available"
                      ? "bg-green-500 text-gray-100 hover:bg-green-600" :
                      "bg-white text-subtext hover:bg-gray-200"
                      
                  }`}
                >
                  {vehicle.reservation_status ===  "available"  ? (
                    <FiCheckCircle className="mr-2" />
                  ):
                   (
                    <FiXCircle className="mr-2" />
                  ) }
                  {vehicle.reservation_status === "available" ? "Réservé" : "Fermer"}
                </button> */}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default VehicleDetails;