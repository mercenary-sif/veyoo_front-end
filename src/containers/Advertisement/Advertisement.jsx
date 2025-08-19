import advertisement_cover from "../../assets/advt.png";
import { GrAnnounce } from "react-icons/gr";
import { TbClockHour8Filled } from "react-icons/tb";
import { BsCalendar2DateFill } from "react-icons/bs";
import { IoIosArrowForward } from "react-icons/io";
import useVeYooAxios from "../../components/Context/useVeYooAxios";
import { useEffect, useState } from "react";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

import { Loading, ErrorGetData } from "../../components/export";

const Advertisement = ({ onShowDetails }) => {
  const [advertisements, setAdvertisements] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [emptyDataList, setEmptyDataList] = useState(null);
  const [currentSlide, setCurrentSlide] = useState(0);

  const VeYooAxios = useVeYooAxios();

  useEffect(() => {
    const controller = new AbortController();

    const fetchAdvertisements = async () => {
      setIsLoading(true);
      try {
        const response = await VeYooAxios.get("/advertisements/advertisements-list/", {
          signal: controller.signal,
        });

        const data = response.data;
        if (response.status === 200 && data.advertisement?.length > 0) {
          const mappedAdvertisements = data.advertisement.map((ad) => ({
            id: ad.id,
            title: ad.title,
            content: ad.content,
            priority: ad.priority,
            start_date: ad.start_date,
            end_date: ad.end_date,
            created_by: ad.created_by,
            updated_by: ad.updated_by,
            cover_base64: ad.cover_base64 ? `data:image/jpeg;base64,${ad.cover_base64}` : null,
            pdf_base64: ad.pdf_base64,
          }));
          setAdvertisements(mappedAdvertisements);
          setError(null);
          setEmptyDataList(null);
        } else {
          setEmptyDataList(data.message || "Aucune annonce trouvée.");
        }
      } catch (err) {
        if (err.name === "CanceledError") return;

        if (err.response?.status === 404) {
          setEmptyDataList("Aucune annonce trouvée.");
        } else if (err.request) {
          setError("Erreur de connexion au serveur");
        } else {
          setError("Une erreur est survenue lors du chargement des annonces");
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchAdvertisements();

    return () => controller.abort();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // === NOTE ===
  // We intentionally always show the "Voir les détails" button for the current slide
  // (no overflow detection). This ensures the user can always open the ad details/pdf.

  const settings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    beforeChange: (_, next) => setCurrentSlide(next),
    arrows: advertisements.length > 1,
    appendDots: (dots) => (
      <div className="mt-4">
        <ul className="m-0 p-0 flex justify-center">{dots}</ul>
      </div>
    ),
    customPaging: (i) => (
      <div className={`w-2 h-2 rounded-full ${i === currentSlide ? "bg-blue-500" : "bg-gray-300"}`} />
    ),
  };

  return (
    <div className="p-[2rem]">
      {isLoading ? (
        <Loading loading_txt={"Chargement des annonces..."} />
      ) : error ? (
        <ErrorGetData error={error} />
      ) : emptyDataList ? (
        <div className="flex w-full flex-col-reverse md:flex-row justify-center items-center">
        <div className="flex flex-1 flex-col items-start p-[2rem] text-center">
          <h1 className="text-[26px] md:text-[28px] lg:text-[45px] font-bold flex items-center gap-[1rem]">
            <GrAnnounce className="text-[var(--color-subtext)]" />
            <span className="text-[var(--color-subtext)]">Annonces</span>
            <span className="text-[var(--color-text)]">Internes</span>
          </h1>
          <div className="mt-6 text-[16px] lg:text-[22px] text-[var(--color-text)]">{emptyDataList}</div>
        </div>
        <div className="flex flex-1 justify-center items-center md:w-1/2 p-5">
                <img
                  className="w-full max-w-md h-auto object-contain"
                  src={ advertisement_cover}
                  alt={ "Annonce"}
                />
          </div>
        </div>
      ) : (
        <Slider {...settings} className="w-full ad-slider">
          {advertisements.map((ad, index) => (
           <>
            <div key={ad.id} className="flex w-full flex-col-reverse md:flex-row justify-center items-center">
              <div className="space-y-6 flex-1 md:w-1/2">
                <div className="flex flex-col justify-center items-start gap-[5px] p-5">
                  <h1 className="text-[26px] md:text-[28px] lg:text-[45px] font-bold w-full flex justify-start items-center gap-[1rem]">
                    <GrAnnounce
                      className="text-[var(--color-subtext)] hover:text-[var(--color-blog)] cursor-pointer transition-colors duration-300"
                      style={{ fill: "currentColor" }}
                    />
                    <span className="text-[var(--color-subtext)]">Annonces</span>
                    <span className="text-[var(--color-text)]">Internes</span>
                  </h1>

                  <div className="flex justify-start items-center gap-[1rem] text-[14px] lg:text-[18px] font-normal text-start text-[var(--color-text)]">
                    <BsCalendar2DateFill className="text-[var(--color-subtext)]" />
                    <p>{ad.start_date ? new Date(ad.start_date).toLocaleDateString() : "-"}</p>
                    <TbClockHour8Filled className="text-[var(--color-subtext)]" />
                    <p>{ad.start_date ? new Date(ad.start_date).toLocaleTimeString() : "-"}</p>
                  </div>

                  <h3 className="text-[16px] lg:text-[22px] font-normal text-start line-clamp-3 text-[var(--color-text)]">
                    {ad.content || ""}
                  </h3>

                  {/* always show button for the current slide */}
                  {index === currentSlide && (
                    <button
                      onClick={() => onShowDetails(ad)}
                      className="flex justify-center items-center gap-[2px] mt-[2rem] bg-transparent border-none outline-none cursor-pointer transition-all duration-300 ease-in-out hover:scale-105 hover:text-subtext hover:gap-[1rem]"
                    >
                      Voir les détails de l'annonce
                      <IoIosArrowForward className="text-current" />
                    </button>
                  )}
                </div>
              </div>

              <div className="flex flex-[0.4] justify-center items-center md:w-1/2 p-5">
                <img
                  className="w-full max-w-md h-auto object-contain"
                  src={ad.cover_base64 || advertisement_cover}
                  alt={ad.title || "Annonce"}
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = advertisement_cover;
                  }}
                />
              </div>
            </div>
           </>
          ))}
        </Slider>
      )}
    </div>
  );
};

export default Advertisement;
