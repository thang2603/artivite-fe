import { type ReactNode } from "react";
import BottomMenu from "./BottomMenu";
import LeftMenu from "./LeftMenu";

interface DefaultLayoutProps {
  children: ReactNode;
}
const DefaultLayout = ({ children }: DefaultLayoutProps) => {
  return (
    <div className="w-screen h-screen  relative ">
      <header className="w-full h-14  shadow-sm flex items-center justify-between px-4 border-b border-gray-500 bg-white ">
        <div className="text-lg font-bold">Artivive</div>
      </header>
      <main className="flex relative  h-[calc(100vh-56px)] ">
        <nav className="w-96 min-w-96 h-full border-r">
          <LeftMenu />
        </nav>
        <nav className="flex-1 relative flex flex-col">
          <div className="h-full w-[calc(100vw-384px)] relative">
            {children}
          </div>
          <div className="h-64 relative border-t  bg-red-50">
            <BottomMenu />
          </div>
        </nav>
      </main>
    </div>
  );
};

export default DefaultLayout;
