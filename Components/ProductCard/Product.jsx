const Product = ({ id, title, image, price, status, buttonText, lastOrderDate, isSelected, onSelect }) => {
  const handleClick = () => {
    if (!status) return;
    onSelect(id);
  };

  return (
    <div
      onClick={handleClick}
      className={`relative bg-white rounded-xl border transition-all duration-300 cursor-pointer overflow-hidden flex flex-col w-64 ${
        isSelected ? "border-primary shadow-lg" : "border-gray-200 hover:shadow-md"
      }`}
    >
      {/* Selected Badge */}
      {isSelected && (
        <div className="absolute top-3 left-3 z-30 bg-primary text-white text-[10px] font-semibold px-3 py-1 rounded-full shadow-sm">
          Selected
        </div>
      )}

      {/* Price Ribbon */}
      {price && (
        <div className="absolute top-4.5 -right-5 z-20 rotate-45 bg-blue-500 text-white text-[10px] font-semibold px-4 py-[2px] shadow-sm">
          From £{price}
        </div>
      )}

      {/* Out of Stock Overlay */}
      {!status && (
        <div className="absolute inset-0 bg-slate-400/50 z-20 backdrop-blur-[1px] rounded-xl" />
      )}

      {/* Product Image */}
      <div className="h-[180px] flex items-center justify-center p-4">
        <img src={image} alt={title} className="max-h-full object-cover" />
      </div>

      {/* Content */}
      <div className="flex-1 border-t border-gray-100 bg-gray-50 p-4 text-center rounded-b-xl flex flex-col justify-between">
        <div>
          <h3 className="text-base font-semibold text-gray-800 mb-1">{title}</h3>
          {lastOrderDate && (
            <p className="text-xs text-gray-500 mb-2">Last Ordered: {lastOrderDate}</p>
          )}
        </div>
        <span className="text-md text-primary bold-font mt-auto">{buttonText}</span>
      </div>
    </div>
  );
};

export default Product;
