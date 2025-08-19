import { FaCheckCircle } from 'react-icons/fa';
import {BadgeAlert} from 'lucide-react';

const MessageComponent = ({ isSuccess, message , isModel}) => {
  if (!message) return null;

  return (
    <div className={`fixed inset-0 z-50 flex items-end justify-end bg-black bg-opacity-50`}>
    <div
      className="p-[1rem] rounded m-auto flex items-center text-[14px] lg:text-[16px] font-semibold w-[70%]"
      style={{
        backgroundColor: isSuccess ? '#BFE0FF' : '#FFCCCC',
        color: isSuccess ? '#535353' : '#EF4444'
      }}
    >
       {isSuccess ? (
        <FaCheckCircle className="mr-3" />
      ) : (
        <BadgeAlert className="mr-3" />
      )}
      <span>{message}</span>
    </div>
     </div>
  );
};

export default MessageComponent;