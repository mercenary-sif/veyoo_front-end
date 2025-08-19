import { useEffect, useState, lazy, Suspense } from "react";
import { Footer, Navbar } from "../../components/export";

// Lazy load the container components
const Advertisements = lazy(() => import("../../containers/Advertisement/Advertisement"));
const AdvertisementDetails = lazy(() => import("../../containers/Detailes/AdvertisementDetails"));
const Vehicles = lazy(() => import("../../containers/Vehicles/Vehicles"));
const VehicleDetails = lazy(() => import("../../containers/Detailes/VehicleDetails"));
const Materials = lazy(() => import("../../containers/Materials/Tools"));
const ToolDetails = lazy(() => import("../../containers/Detailes/ToolDetails"));
const Malfunctions = lazy(() => import("../../containers/Malfunctions/Malfunctions"));
const MalfunctionDetails = lazy(() => import("../../containers/Detailes/MalfunctionDetails"));

const Home = () => {
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [selectedTool, setSelectedTool] = useState(null);
  const [selectedMalfunction, setSelectedMalfunction] = useState(null);
  const [selectedAdvertisement, setSelectedAdvertisement] = useState(null);

  useEffect(() => {
    if (
      selectedVehicle ||
      selectedTool ||
      selectedMalfunction ||
      selectedAdvertisement
    ) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }

    // Cleanup function
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [selectedVehicle, selectedTool, selectedMalfunction, selectedAdvertisement]);

  return (
    <div>
      <Navbar />
      <Suspense fallback={<div>Loading...</div>}>
        <Advertisements
          onShowDetails={(ad) => setSelectedAdvertisement(ad)}
        />
        {selectedAdvertisement && (
          <AdvertisementDetails
            advertisement={selectedAdvertisement}
            onClose={() => setSelectedAdvertisement(null)}
          />
        )}
        <Vehicles setSelectedVehicle={setSelectedVehicle} />
        {selectedVehicle && (
          <VehicleDetails
            vehicle={selectedVehicle}
            onClose={() => setSelectedVehicle(null)}
          />
        )}
        <Materials setSelectedTool={setSelectedTool} />
        {selectedTool && (
          <ToolDetails tool={selectedTool} onClose={() => setSelectedTool(null)} />
        )}
        <Malfunctions setSelectedMalfunction={setSelectedMalfunction} />
        {selectedMalfunction && (
          <MalfunctionDetails
            malfunction={selectedMalfunction}
            onClose={() => setSelectedMalfunction(null)}
          />
        )}
      </Suspense>
      <Footer />
    </div>
  );
};

export default Home;