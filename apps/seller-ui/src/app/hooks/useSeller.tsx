import { useQuery } from "@tanstack/react-query";
import axiosInstance from "../utils/axiosInstance";

// fetch seller data from the API
const fetchSeller = async () => {
  const response = await axiosInstance.get("/api/v1/logged-in-seller");
  console.log("API response for logged-in seller:", response.data);
  return response.data.seller;
};

const useSeller = () => {
  const {
    data: seller,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ["seller"],
    queryFn: fetchSeller,
    staleTime: 5 * 60 * 1000, // Cache user data for 5 minutes
    retry: 1, // enable automatic retries on failure
  });

  return { seller, isLoading, isError, refetch };
};

export default useSeller;
