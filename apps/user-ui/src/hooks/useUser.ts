import { useQuery } from "@tanstack/react-query";
import axiosInstance from "../utils/axiosInstance";

// fetch user data from the API
const fetchUser = async () => {
  const response = await axiosInstance.get("/api/v1/logged-in-user");
  console.log("API response for logged-in user:", response.data);
  return response.data.user;
};

const useUser = () => {
  const {
    data: user,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ["user"],
    queryFn: fetchUser,
    staleTime: 5 * 60 * 1000, // Cache user data for 5 minutes
    retry: 1, // enable automatic retries on failure
  });

  return { user, isLoading, isError, refetch };
};

export default useUser;
