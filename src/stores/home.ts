import { defineStore } from "pinia";
import callApi from "./mock_data/mock-api-home";
import { ElNotification } from "element-plus";

export interface rawDataType {
  Material: string;
  ProductCode: string;
  Location: string;
  QTY: number;
}

export interface TableData {
  Material: string;
  ProductCode: string;
  [key: string]: string | number;
}

export interface locationListType {
  Id: string;
  Location: string;
}

export interface materialDetailType {
  Material: string;
  ProductCode: string;
  Description: string;
}

export const homeStore = defineStore("home", {
  state: () => ({
    loadingRawData: false,
    rawData: [] as rawDataType[],
    fillterValue: {
      Material: "",
      ProductCode: "",
    },
    loadingGetMaterialDetail: false,
  }),
  getters: {
    locationList(): locationListType[] {
      const locationList = Array.from(
        new Set(this.rawData.map((item) => item.Location))
      ).map((location, index) => ({
        Id: "location_" + index,
        Location: location,
      }));
      return locationList || [];
    },
    loadingData(): boolean {
      return this.loadingRawData;
    },
    dataTable(): TableData[] {
      const data: rawDataType[] = this.rawData;
      // Identify unique ProductCode and Material pairs
      const dataMap = data.map(
        (item) => `${item.Material}___${item.ProductCode}`
      );
      const uniquePairs = Array.from(new Set(dataMap)).map((pair) => {
        const [Material, ProductCode] = pair.split("___");
        return { Material, ProductCode };
      });

      // Get the list of locations
      const locationList: locationListType[] = Array.from(
        new Set(data.map((item) => item.Location))
      ).map((item, index) => ({
        Id: "location_" + index,
        Location: item,
      }));

      // Create the new data structure
      const newData = uniquePairs.map((pair) => {
        const entry: TableData = {
          Material: pair.Material,
          ProductCode: pair.ProductCode,
        };
        locationList.forEach((site) => {
          const foundItem = data.find(
            (item) =>
              item.Material === pair.Material &&
              item.ProductCode === pair.ProductCode &&
              item.Location === site.Location
          );
          entry[site.Id] = foundItem ? foundItem.QTY : 0;
        });
        return entry;
      });

      // filter data with Material and ProductCode by text include
      if (!this.fillterValue.Material && !this.fillterValue.ProductCode) {
        return newData || [];
      }
      const filteredData = newData.filter((item) => {
        return (
          item.Material.toLowerCase().includes(this.fillterValue.Material) &&
          item.ProductCode.toLowerCase().includes(this.fillterValue.ProductCode)
        );
      });
      console.table(filteredData);
      return filteredData || [];
    },
    materialListUnique(): string[] {
      const data: rawDataType[] = this.rawData;
      const MaterialList = Array.from(
        new Set(data.map((item) => `${item.Material}___${item.ProductCode}`))
      );
      return MaterialList || [];
    },
    loadingMaterialDetail(): boolean {
      return this.loadingGetMaterialDetail;
    },
  },
  actions: {
    async getData() {
      // Mock get data from API
      try {
        this.loadingRawData = true;
        const data: rawDataType[] = await callApi.list();
        this.rawData = data;
      } catch (error) {
        console.error(error);
        ElNotification({
          title: "Error",
          message: "Error fetching data",
          type: "error",
        });
      } finally {
        this.loadingRawData = false;
      }
    },
    saveState(data: TableData[]): Promise<string> {
      return new Promise((resolve, reject) => {
        const revertedData: rawDataType[] = [];
        try {
          data.forEach((entry) => {
            const { Material, ProductCode, ...locations } = entry;
            Object.keys(locations).forEach((location: string) => {
              const valueNumber = Number(locations[location]);
              // map location to locationId with locationList
              const locationLabel = this.locationList.find(
                (item) => item.Id === location
              )?.Location;

              revertedData.push({
                Material: Material,
                ProductCode: ProductCode,
                Location: locationLabel || location,
                QTY: valueNumber,
              });
            });
          });
          // Merge new state with old state
          const oldState: rawDataType[] = this.rawData;
          revertedData.forEach((newEntry) => {
            const foundIndex = oldState.findIndex(
              (oldEntry) =>
                oldEntry.Material === newEntry.Material &&
                oldEntry.ProductCode === newEntry.ProductCode &&
                oldEntry.Location === newEntry.Location
            );
            if (foundIndex === -1) {
              oldState.push(newEntry);
            } else {
              oldState[foundIndex].QTY = newEntry.QTY;
            }
          });
          this.rawData = oldState;
          resolve("State aved");
        } catch (error) {
          ElNotification({
            title: "Error",
            message: "Something went wrong",
            type: "error",
          });
          reject(error);
        }
      });
    },
    saveData(data: TableData[]): Promise<string> {
      return new Promise((resolve, reject) => {
        const revertedData: rawDataType[] = [];
        try {
          data.forEach((entry) => {
            const { Material, ProductCode, ...locations } = entry;
            Object.keys(locations).forEach((location: string) => {
              const valueNumber = Number(locations[location]);
              // map location to locationId with locationList
              const locationLabel = this.locationList.find(
                (item) => item.Id === location
              )?.Location;

              revertedData.push({
                Material: Material,
                ProductCode: ProductCode,
                Location: locationLabel || location,
                QTY: valueNumber,
              });
            });
          });
          // Merge new state with old state
          const savingData: rawDataType[] = this.rawData;
          revertedData.forEach((newEntry) => {
            const foundIndex = savingData.findIndex(
              (savingData) =>
                savingData.Material === newEntry.Material &&
                savingData.ProductCode === newEntry.ProductCode &&
                savingData.Location === newEntry.Location
            );
            if (foundIndex === -1) {
              savingData.push(newEntry);
            } else {
              savingData[foundIndex].QTY = newEntry.QTY;
            }
          });
          // clonse with out reference
          const newData = JSON.parse(JSON.stringify(savingData));
          console.table(newData);
          ElNotification({
            title: "Data saved",
            message: "Data saved successfully",
            type: "success",
          });
          resolve("Data saved");
        } catch (error) {
          ElNotification({
            title: "Error",
            message: "Error saving data",
            type: "error",
          });
          reject(error);
        }
      });
    },
    fillterTable(data: { Material?: string; ProductCode?: string }) {
      const value = {
        Material: data.Material ?? "",
        ProductCode: data.ProductCode ?? "",
      };
      this.fillterValue = value;
    },
    async getMaterialDetail(material: string): Promise<materialDetailType> {
      try {
        this.loadingGetMaterialDetail = true;
        const newMaterial = await callApi.getMeterialDetail(material);
        return newMaterial;
      } catch (error) {
        console.error(error);
        ElNotification({
          title: "Warning",
          message: (error as string) || "Error fetching material",
          type: "warning",
        });
        this.loadingGetMaterialDetail = false;
        return Promise.reject(error);
      } finally {
        this.loadingGetMaterialDetail = false;
      }
    },
    addNewMateriaToState({ Material, ProductCode }: materialDetailType) {
      const newMaterial: rawDataType[] = [];
      const locationList = this.locationList;
      locationList.forEach((location) => {
        newMaterial.push({
          Material,
          ProductCode,
          Location: location.Location,
          QTY: 0,
        });
      });
      this.loadingRawData = true;
      this.rawData = [...this.rawData, ...newMaterial];
      setTimeout(() => {
        this.loadingRawData = false;
      }, 50);
    },
  },
});
