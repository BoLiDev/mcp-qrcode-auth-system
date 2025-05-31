/** @format */

import { createContext, useContext } from "react";
import { QRCodeStore } from "./QRCodeStore";

export const qrCodeStore = new QRCodeStore();

export const StoreContext = createContext({
  qrCodeStore,
});

export const useStores = () => {
  return useContext(StoreContext);
};
