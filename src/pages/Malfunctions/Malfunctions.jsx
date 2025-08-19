import { useEffect, useState } from "react";
import { Footer, Navbar } from "../../components/export";
import { MalfunctionDetails, MalfunctionsList } from "../../containers/export";

const Malfunctions = () => {
  const [selectedMalfunction, setSelectedMalfunction] = useState(null);

  // Prevent body scrolling when details are shown
  useEffect(() => {
    if (selectedMalfunction) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }

    return () => {
      document.body.style.overflow = "auto";
    };
  }, [selectedMalfunction]);

  return (
    <div>
      <Navbar />
      <MalfunctionsList setSelectedMalfunction={setSelectedMalfunction} />
      {selectedMalfunction && (
        <MalfunctionDetails
          malfunction={selectedMalfunction}
          onClose={() => setSelectedMalfunction(null)}
        />
      )}
      <Footer />
    </div>
  );
};

export default Malfunctions;