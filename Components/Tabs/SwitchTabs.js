const SwitchTabs = ({ tabs, selectedTab, onTabChange }) => {
  return (
    <div className="w-full flex rounded-md overflow-hidden border border-green-700 mb-6">
      {tabs.map((tab) => {
        const isActive = selectedTab === tab.value;
        return (
          <button
            key={tab.value}
            type="button"
            onClick={() => onTabChange(tab.value)}
            className={`w-full py-2 text-sm font-semibold border-r border-black last:border-none transition-all
                ${isActive ? "bg-green-100 text-black" : "bg-white text-black hover:bg-gray-100"}
              `}
          >
            {tab.label}
          </button>
        );
      })}
    </div>
  );
};
export default SwitchTabs;
