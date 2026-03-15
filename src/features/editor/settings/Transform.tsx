import { TextField } from "@radix-ui/themes";
import { Move3DIcon, Rotate3DIcon, Scale3DIcon } from "lucide-react";

const Transform = () => {
  return (
    <div className=" flex flex-col gap-1 px-2 py-4">
      <div className="flex items-center gap-2">
        <Move3DIcon />
        <div className="flex gap-1">
          <TextField.Root size="1" placeholder="X" type="number" />
          <TextField.Root size="1" placeholder="Y" type="number" />
          <TextField.Root size="1" placeholder="Z" type="number" />
        </div>
      </div>
      <div className="flex items-center gap-2">
        <Rotate3DIcon />
        <div className="flex gap-1">
          <TextField.Root size="1" placeholder="X" type="number" />
          <TextField.Root size="1" placeholder="Y" type="number" />
          <TextField.Root size="1" placeholder="Z" type="number" />
        </div>
      </div>
      <div className="flex items-center gap-2">
        <Scale3DIcon />
        <div className="flex gap-1">
          <TextField.Root size="1" placeholder="X" type="number" />
          <TextField.Root size="1" placeholder="Y" type="number" />
          <TextField.Root size="1" placeholder="Z" type="number" />
        </div>
      </div>
    </div>
  );
};

export default Transform;
