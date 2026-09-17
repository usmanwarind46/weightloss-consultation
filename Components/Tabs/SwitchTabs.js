const SwitchTabs = ({ tabs, selectedTab, onTabChange }) => {
  return (
    <div className="mb-5 flex w-full gap-2 rounded-xl bg-slate-100 p-1">
      {tabs.map((tab) => {
        const isActive = selectedTab === tab.value;
        return (
          <button
            key={tab.value}
            type="button"
            onClick={() => onTabChange(tab.value)}
            className={`inter-medium-font w-full rounded-lg py-2 text-[13.5px] transition-all duration-150 cursor-pointer
                ${isActive ? "bg-white text-[#4565BF] shadow-[0_1px_3px_rgba(15,23,42,0.08)]" : "text-slate-500 hover:text-slate-700"}
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
