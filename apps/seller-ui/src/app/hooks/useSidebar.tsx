import { useAtom } from "jotai";
import { activeSidebarItem } from "../../configs/constants";

function useSidebar() {
  const [activeSidebar, setActiveSidebar] = useAtom(activeSidebarItem);
  return { activeSidebar, setActiveSidebar };
}

export default useSidebar;
