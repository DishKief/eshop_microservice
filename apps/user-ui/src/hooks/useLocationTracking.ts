"use client";

import { useEffect, useState } from "react";

const LOCATION_STORAGE_KEY = "user_location";
const LOCATION_EXPIRY_DAYS = 20;

const getStorageLocation = () => {
  const storedData = localStorage.getItem(LOCATION_STORAGE_KEY);
  if (!storedData) return null;

  const parsedData = JSON.parse(storedData);
  const expiryTime = LOCATION_EXPIRY_DAYS * 24 * 60 * 60 * 1000; // 20 days in ms
  const isExpired = Date.now() - parsedData.timestamp > expiryTime;

  return isExpired ? null : parsedData.location;
};

export const useLocationTracking = () => {
  const [location, setLocation] = useState<{
    country: string;
    city: string;
  } | null>(getStorageLocation());

  useEffect(() => {
    if (location) return;

    fetch("http://ip-api.com/json/")
      .then((res) => res.json())
      .then((data) => {
        const newLocation = {
          country: data?.country,
          city: data?.city,
          timestamp: Date.now(),
        };
        setLocation(newLocation);
        localStorage.setItem(LOCATION_STORAGE_KEY, JSON.stringify(newLocation));
      })
      .catch((error) => {
        console.error("Error getting location:", error);
      });
  }, []);

  return location;
};
