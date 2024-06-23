import mockDataList from "./list.json";
import mockDataMaterial from "./material.json";

// {
//   "Material": "MAT0001",
//   "ProductCode": "PC000001",
//   "Location": "A2",
//   "QTY": 100
// },

interface rawDataType {
  Material: string;
  ProductCode: string;
  Location: string;
  QTY: number;
}
interface materialDetailType {
  Material: string;
  ProductCode: string;
  Description: string;
}

export default {
  list(): Promise<rawDataType[]> {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(mockDataList);
      }, 1000);
    });
  },
  getMeterialDetail(Material: string): Promise<materialDetailType> {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const material = (mockDataMaterial as materialDetailType[]).find(
          (item) => item.Material.toLowerCase() === Material.toLowerCase()
        );
        if (material) {
          resolve(material);
        } else {
          reject("Material not found");
        }
      }, 500);
    });
  },
};
