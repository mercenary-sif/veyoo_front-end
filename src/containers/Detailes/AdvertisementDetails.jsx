import { RiCloseLine } from "react-icons/ri";
import { TbClockHour8Filled } from "react-icons/tb";
import { BsCalendar2DateFill } from "react-icons/bs";
import { BsFileEarmarkText } from "react-icons/bs";
import advertisement_cover from "../../assets/advt.png";
import { FiXCircle } from "react-icons/fi";

const AdvertisementDetails = ({ advertisement, onClose }) => {
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
                <h2 className="text-white text-xl font-bold">Détails de l'annonce</h2>
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
                <div className="flex flex-col md:flex-row justify-between items-start gap-6 mb-6">
                  <div className="w-full md:w-2/3">
                    <h1
                      className="text-2xl font-bold mb-4"
                      style={{ color: "var(--color-text)" }}
                    >
                      {advertisement.title}
                    </h1>

                    <div
                      className="flex items-center gap-4 mb-6"
                      style={{ color: "var(--color-text)" }}
                    >
                      <div className="flex items-center gap-2">
                        <BsCalendar2DateFill className="text-[var(--color-subtext)]" />
                        <span>{new Date(advertisement.start_date).toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <TbClockHour8Filled className="text-[var(--color-subtext)]" />
                        <span>{new Date(advertisement.start_date).toLocaleTimeString()}</span>
                      </div>
                    </div>

                    <div
                      className="prose max-w-none"
                      style={{ color: "var(--color-text)" }}
                    >
                      {advertisement.content}
                    </div>
                  </div>

                  <div className="w-full md:w-1/3 flex justify-center">
                    <img
                      src={advertisement.cover_base64 || advertisement_cover}
                      alt="Annonce"
                      className="max-h-64 object-contain rounded-lg"
                    />
                  </div>
                </div>

                {advertisement.pdf_base64 && (
                  <div className="mt-6">
                    <h3
                      className="text-lg font-semibold mb-4"
                      style={{ color: "var(--color-text)" }}
                    >
                      Pièce jointe
                    </h3>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      <a
                        href={`data:application/pdf;base64,${advertisement.pdf_base64}`}
                        download={`annonce_${advertisement.id}.pdf`}
                        className="border rounded-lg p-3 transition"
                        style={{
                          borderColor: "var(--color-nav-shadow)",
                          backgroundColor: "transparent",
                          color: "var(--color-text)",
                        }}
                      >
                        <div className="flex items-center gap-2">
                          <BsFileEarmarkText
                            className="text-xl"
                            style={{ color: "var(--color-subtext)" }}
                          />
                          <span className="truncate">Fichier PDF</span>
                        </div>
                      </a>
                    </div>
                  </div>
                )}
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

export default AdvertisementDetails;