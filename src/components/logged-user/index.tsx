import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Popover, PopoverTrigger } from "@/components/ui/popover";
import LoggedUserPopup from "../logged-user-popup";
import { authStore } from "@/store/auth.store";

const LoggedUser = () => {
  const { user } = authStore.getState().load();

  const logout = () => {
    authStore.getState().logout();
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <div className="flex cursor-pointer items-center gap-2 duration-200 hover:bg-gray-100 hover:opacity-80">
          <Avatar>
            <AvatarImage
              src="https://i.pinimg.com/280x280_RS/3a/66/f8/3a66f807ecd9a390077624a2fcf002ea.jpg"
              alt="avatar"
            />
            <AvatarFallback>
              {user?.name?.slice(0, 1).toUpperCase()}
            </AvatarFallback>
          </Avatar>

          <p className="overflow-hidden truncate text-ellipsis text-nowrap text-[16px] font-[400] text-black">
            {user?.name.split(" ")[0]}
          </p>
        </div>
      </PopoverTrigger>

      <LoggedUserPopup logout={logout} />
    </Popover>
  );
};

export default LoggedUser;