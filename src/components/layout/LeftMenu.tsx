import { SettingsIcon, Shapes } from "lucide-react";
import Transform from "../../features/editor/settings/Transform";
import { useState } from "react";
import Elements from "../../features/editor/elements/Elements";

const LEFT_MENU = [
  {
    value: "settings",
    label: "Settings",
    icon: <SettingsIcon />,
  },
  {
    value: "elements",
    label: "Elements",
    icon: <Shapes />,
  },
];
const LeftMenu = () => {
  const [tab, setTab] = useState(LEFT_MENU[0].value);

  const handleTabChange = (value: string) => {
    setTab(value);
  };

  return (
    <div className="flex h-full">
      <div className="w-16 border-r border-gray-500 h-full  py-4 f flex flex-col items-center gap-8 ">
        {LEFT_MENU.map((item) => (
          <div
            key={item.value}
            className="flex justify-center items-center flex-col gap-1 cursor-pointer "
            onClick={() => handleTabChange(item.value)}
          >
            {item.icon}
            <span className="text-xs">{item.label}</span>
          </div>
        ))}
      </div>
      <div className="flex-1">
        {tab === "settings" && <Transform />}
        {tab === "elements" && <Elements />}
      </div>
    </div>
  );
};

export default LeftMenu;
