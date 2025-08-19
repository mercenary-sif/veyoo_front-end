import { useEffect, useState } from "react";
import { Footer, Navbar } from "../../components/export";
import { ToolDetails, ToolsList } from "../../containers/export";

const Materials = () => {
  const [selectedTool, setSelectedTool] = useState(null);

  useEffect(() => {
    if (selectedTool) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }

    return () => {
      document.body.style.overflow = "auto";
    };
  }, [selectedTool]);

  return (
    <div>
      <Navbar />
      <ToolsList setSelectedTool={setSelectedTool} />
      {selectedTool && (
        <ToolDetails tool={selectedTool} onClose={() => setSelectedTool(null)} />
      )}
      <Footer />
    </div>
  );
};

export default Materials;