
const LoadingScreen = ({loading_txt}) => {
  return (
    <div className="fixed inset-0 bg-black/85 backdrop-blur-[0.5px] flex flex-col justify-center items-center z-[2000]">
      <div className="w-full h-full bg-[var(--color-9)] flex flex-col justify-center items-center">
        <div className="w-10 h-10 border-4 border-[#f3f3f3] border-t-black rounded-full animate-spin"></div>
        <p className="mt-4 text-lg text-[#f3f3f3] text-center">
         {loading_txt}
        </p>
      </div>
    </div>
  );
};

export default LoadingScreen;