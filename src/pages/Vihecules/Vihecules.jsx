import { useEffect, useState } from "react";
import { Footer, Navbar } from "../../components/export";
import VehiculsList from "../../containers/Vehicles/VehiculsList";
import { VehicleDetails } from "../../containers/export";

const Vihecules = () => {
  const [selectedVehicle, setSelectedVehicle] = useState(null);

  // Prevent body scrolling when modal is open
  useEffect(() => {
    if (selectedVehicle) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }

    // Cleanup function
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [selectedVehicle]);

  return (
    <div>
      <Navbar />
      <VehiculsList setSelectedVehicle={setSelectedVehicle} />
      {selectedVehicle && (
        <VehicleDetails vehicle={selectedVehicle} onClose={() => setSelectedVehicle(null)} />
      )}
      <Footer />
    </div>
  );
};

export default Vihecules;