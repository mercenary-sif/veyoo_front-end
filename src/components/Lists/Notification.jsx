import { TbClockHour8Filled } from "react-icons/tb";
import { IoIosArrowForward } from "react-icons/io";
import { useRef, useState, useEffect } from 'react';

const Notification = ({type, title, content, time, date, sender}) => {
  const contentRef = useRef(null);
  const [isOverflowing, setIsOverflowing] = useState(false);

  useEffect(() => {
    if (contentRef.current) {
      const isTruncated = contentRef.current.scrollHeight > contentRef.current.clientHeight;
      setIsOverflowing(isTruncated);
    }
  }, [content]);

  return (
    <div className='flex flex-col justify-between items-center p-[1rem] bg-nav shadow-xl w-full rounded-md border border-gray-200 dark:border-gray-700'>
      <div className="flex justify-between items-center w-full">
        <div className={`p-[8px] rounded-md text-sm font-medium ${
          type === "System" 
            ? "bg-subtext text-white" 
            : "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300"
        }`}>
          {type}
        </div>
        <div className="flex justify-center items-center gap-[1rem] text-gray-700 dark:text-gray-300 text-[14px] lg:text-[18px] font-normal">
          <TbClockHour8Filled />
          <h4>{time} - {date}</h4>
        </div>
      </div>
      
      <div className="flex flex-col justify-start items-start gap-[8px] w-full p-3">
        <h3 className="text-[16px] lg:text-[19px] font-normal text-gray-900 dark:text-white mb-2 line-clamp-1">
          {title}
        </h3>
        <p 
          ref={contentRef} 
          className="text-gray-600 dark:text-gray-400 mb-2 text-[14px] md:text-[16px] lg:text-[18px] line-clamp-1"
        > 
          {content} 
        </p>
      </div>
      
      <div className="flex w-full justify-between items-center px-[1rem]">
        <h5 className="text-blog mb-2 text-[12px] md:text-[14px] lg:text-[16px] line-clamp-1">
          {sender}
        </h5>
        {isOverflowing && (
          <button className='flex justify-center text-[12px] md:text-[14px] lg:text-[16px] items-center gap-[2px] bg-transparent border-none outline-none text-gray-600 dark:text-gray-400 hover:text-subtext dark:hover:text-subtext cursor-pointer transition-all duration-300 ease-in-out hover:scale-105 hover:gap-[1rem]'>
            Voir les détails
            <IoIosArrowForward className="text-subtext"/>
          </button>
        )}
      </div>
    </div>
  )
}

export default Notification