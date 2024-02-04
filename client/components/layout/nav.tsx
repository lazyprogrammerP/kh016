import { Bars3BottomRightIcon, ChartPieIcon, CogIcon, IdentificationIcon, UserCircleIcon } from "@heroicons/react/24/outline";

const Nav = () => {
  return (
    <div className={"w-full p-4 flex items-center justify-between bg-white rounded-md shadow-md shadow-gray-100"}>
      <span className={"text-2xl font-bold"}>0xAuth</span>

      <div className={"hidden lg:flex items-center gap-4"}>
        <div className={"p-2 flex items-center justify-center gap-2 hover:bg-gray-50 rounded-md cursor-pointer transition-all duration-300"}>
          <ChartPieIcon className={"w-5 h-5"} />
          <span className={"text-sm text-gray-500"}>Personal Dashboard</span>
        </div>

        <div className={"p-2 flex items-center justify-center gap-2 bg-gray-50 rounded-md cursor-pointer"}>
          <IdentificationIcon className={"w-5 h-5"} />
          <span className={"text-sm"}>Identity Management</span>
        </div>

        <div className={"p-2 flex items-center justify-center gap-2 hover:bg-gray-50 rounded-md cursor-pointer transition-all duration-300"}>
          <CogIcon className={"w-5 h-5"} />
          <span className={"text-sm text-gray-500"}>Authorized Apps</span>
        </div>
      </div>

      <div className={"flex items-center gap-2"}>
        <Bars3BottomRightIcon className={"lg:hidden w-8 h-8 cursor-pointer"} />
        <UserCircleIcon className={"w-8 h-8 cursor-pointer"} />
      </div>
    </div>
  );
};

export default Nav;
