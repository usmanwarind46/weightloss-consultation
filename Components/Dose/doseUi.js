import React from "react";
import toast from "react-hot-toast";
import { FaMinus, FaPlus, FaRegCircle, FaDotCircle, FaCheck } from "react-icons/fa";
import { MdDelete } from "react-icons/md";
import moment from "moment/moment";
import ConfirmationModal from "../Modal/ConfirmationModal";

const Dose = ({ doseData, onAdd, onIncrement, onDecrement, isSelected, qty, allow, totalSelectedQty }) => {
  const [showModal, setShowModal] = React.useState(false);

  const allowed = parseInt(allow || 100);
  const doseStatus = doseData?.stock?.status;

  const handleAdd = (e) => {
    e.stopPropagation();
    if (!isSelected) {
      onAdd();
    }
  };

  const handleIncrement = (e) => {
    e.stopPropagation();
    const totalQty = totalSelectedQty() + 1;

    if (totalQty > allowed) {
      toast.error(`You can only select up to ${allowed} units in total.`);
    } else if (`doseData.qty >= doseData.stock.quantity`) {
      toast.error(`Only ${doseData.stock.quantity} units are available.`);
    } else {
      onIncrement(doseData?.id);
    }
  };


  const handleDecrement = (e) => {
    e.stopPropagation();
    if (qty > 1) {
      onDecrement();
    } else {
      // Qty 1 → delete
      setShowModal(true);
    }
  };

  const handleDelete = () => {
    setShowModal(false);
    onDecrement(); // Qty 1 case → remove
  };

  return (
    <>
      <div
        onClick={handleAdd}
        className={`relative border-3 rounded-lg p-4 mt-4 cursor-pointer transition-all duration-300 flex justify-between items-center 
        ${doseStatus === 0
            ? "bg-gray-100 opacity-60 cursor-not-allowed"
            : isSelected
              ? "border-purple-600 bg-purple-50"
              : "border-gray-200 bg-white hover:bg-gray-50"
          }`}
      >
        {/* Out of Stock Banner */}
        {doseStatus === 0 && <div className="absolute -top-4 left-2 text-xs bg-black text-white px-2 py-0.5 rounded">Out of Stock</div>}

        {/* Selected Tick */}
        {isSelected &&
          <div className="absolute -top-3 right-0 w-6 h-6 bg-purple-600 text-white rounded-full flex items-center justify-center text-xs"><FaCheck />
          </div>}

        <div className="flex items-start space-x-4">
          <div className="pt-1">
            {isSelected ?
              <FaDotCircle size={20} className="text-purple-600" />
              : <FaRegCircle  size={20} className="text-gray-500" />}
          </div>
          <div>
            <h3 className="font-semibold text-gray-800">{doseData?.product_name} {doseData?.recommended && <span className="ml-2 bg-purple-100 text-purple-700 px-2 py-0.5 text-xs rounded">Recommended</span>}</h3>
            <p className="text-sm text-gray-600">{doseData?.name}</p>
            {doseData?.expiry && <p className="text-xs text-gray-400">Expiry: {moment(doseData?.expiry).format("DD/MM/YYYY")}</p>}
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <div className="text-right">
            <p className="font-bold text-gray-900 text-lg">£{parseFloat(doseData?.price).toFixed(2)}</p>
            {doseData?.oldPrice && <p className="text-xs line-through text-gray-400">£{doseData.oldPrice}</p>}
          </div>

          {isSelected && (
            <div className="flex items-center space-x-2">
              <button type="button" onClick={handleDecrement} className="w-8 h-8 bg-gray-200 hover:bg-gray-300 rounded-full flex items-center justify-center text-gray-700">
                <FaMinus size={12} />
              </button>

              <span className="px-3 py-1 bg-white border border-gray-300 rounded-md text-sm">{qty}</span>

              <button type="button" onClick={handleIncrement} disabled={qty >= allowed} className={`w-8 h-8 ${qty >= allowed ? "bg-gray-200 opacity-50 cursor-not-allowed" : "bg-gray-200 hover:bg-gray-300"} rounded-full flex items-center justify-center text-gray-700`}>
                <FaPlus size={12} />
              </button>

              <button type="button" onClick={(e) => { e.stopPropagation(); setShowModal(true); }} className="text-red-500 bg-red-100 hover:bg-red-200 p-2 rounded-md">
                <MdDelete />
              </button>
            </div>
          )}
        </div>
      </div>

      <ConfirmationModal showModal={showModal} onConfirm={handleDelete} onCancel={() => setShowModal(false)} />
    </>
  );
};

export default Dose;
