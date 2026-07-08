import { createContext, useContext } from "react";
import { ConfiguratorStore } from "./ConfiguratorStore";

class RootStore {
  constructor() {
    this.configuratorStore = new ConfiguratorStore();
  }
}

export const rootStore = new RootStore();
export const StoreContext = createContext(rootStore);

export const useStores = () => {
  return useContext(StoreContext);
};
