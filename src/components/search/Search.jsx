import { FaSearch } from "react-icons/fa";

const Search = ({ onSearch }) => {
  const handleSearch = (e) => {
    if (onSearch) onSearch(e.target.value);
  };

  return (
    <div className="relative flex w-full items-center group focus-within:group">
      <button
        onClick={() => {}}
        className="absolute left-4 h-5 w-5 text-black/50 group-focus-within:text-[var(--color-subtext)] dark:text-white/50"
      >
        <FaSearch size={22} />
      </button>
      <input
        type="text"
        placeholder="Rechercher par nom..."
        className="w-full p-3 border-2 rounded-xl text-base pl-12 transition duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-[#00c6ff]/80 border-black/20 dark:border-white/20 bg-white/20 dark:bg-black/20 text-black/55 dark:text-white/60 placeholder:text-black/60 dark:placeholder:text-white/50 focus:border-[#00c6ff]"
        onChange={handleSearch}
      />
    </div>
  );
};

export default Search;