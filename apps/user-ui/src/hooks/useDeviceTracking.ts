"use client";

import { useEffect, useState } from "react";
import { UAParser } from "ua-parser-js";

const DEVICE_STORAGE_KEY = "device_info";
const DEVICE_EXPIRY_DAYS = 20;

export const useDeviceTracking = () => {
  const [deviceInfo, setDeviceInfo] = useState<string | null>(null);

  useEffect(() => {
    const getStorageDevice = () => {
      try {
        const storedData = localStorage.getItem(DEVICE_STORAGE_KEY);
        if (!storedData) return null;

        const parsedData = JSON.parse(storedData);

        const expiryTime = DEVICE_EXPIRY_DAYS * 24 * 60 * 60 * 1000;

        const isExpired = Date.now() - parsedData.timestamp > expiryTime;

        return isExpired ? null : parsedData.deviceInfo;
      } catch {
        return null;
      }
    };

    const storedDevice = getStorageDevice();

    if (storedDevice) {
      setDeviceInfo(storedDevice);
      return;
    }

    const parser = new UAParser();
    const device = parser.getResult();

    const deviceInfos = `${
      device.device.type || "Desktop"
    } - ${device.os.name} - ${device.os.version} - ${
      device.browser.name
    } - ${device.browser.version}`;

    setDeviceInfo(deviceInfos);

    localStorage.setItem(
      DEVICE_STORAGE_KEY,
      JSON.stringify({
        deviceInfo: deviceInfos,
        timestamp: Date.now(),
      }),
    );
  }, []);

  return deviceInfo;
};
