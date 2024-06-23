<script lang="ts" setup>
import { ref, onMounted, computed, watch } from "vue";
import { Search } from "@element-plus/icons-vue";
import ModalAddMaterial from "./ModalAddMaterial.vue";
import {
  homeStore,
  type TableData,
  type locationListType,
} from "@/stores/home";
const store = homeStore();

const input = ref<string>("");

const summaryAllLocation = (row: TableData) => {
  let sum = 0;
  for (const key in row) {
    if (key !== "Material" && key !== "ProductCode") {
      sum += Number(row[key]) || 0;
    }
  }
  if (sum === 0) {
    return 0;
  }
  return formatNumber(sum);
};

const formatNumber = (value: number) => {
  return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
};

const loadingData = computed(() => store.loadingData);
// const locationList = computed(() => store.locationList);
// const tableData = computed(() => store.dataTable);
const locationList = ref<locationListType[]>(store.locationList);
const tableData = ref<TableData[]>(store.dataTable);
// const locationList = reactive<locationListType[]>(store.locationList);
// const tableData = reactive<TableData[]>(store.dataTable);

// wacth loadingData Change
watch(loadingData, (value) => {
  if (!value) {
    getDataFromStore();
  }
});

const getDataFromStore = () => {
  locationList.value = store.locationList;
  tableData.value = store.dataTable;
};

const saveData = async () => {
  try {
    await store.saveData(tableData.value);
  } catch (error) {
    console.error(error);
  }
};

const filterData = async () => {
  console.log(input.value);
  const filter = input.value.toLowerCase().trim();
  store.fillterTable({ Material: filter });
  await store.saveState(tableData.value);
  getDataFromStore();
};

const getTabIndex = (key_index: number, material: TableData) => {
  // get index of this meterial
  const materialIndex = tableData.value.findIndex(
    (item) => item.ProductCode === material.ProductCode
  );
  const row = key_index * tableData.value.length + 1;
  return materialIndex + row;
};

onMounted(() => {
  store.getData();
});
</script>

<template>
  <div style="padding: 24px">
    <el-row style="margin: 24px 0">
      <el-col :span="24">
        <div class="flex-center">
          <div style="margin-right: 24px">Material</div>
          <el-input
            size="large"
            v-model="input"
            style="width: 240px"
            clearable
            placeholder="Search Material"
          />
          <el-button
            @click="filterData"
            size="large"
            type="primary"
            style="width: 100px; margin-left: 24px"
            :icon="Search"
            >Search</el-button
          >
          <ModalAddMaterial></ModalAddMaterial>
        </div>
      </el-col>
      <el-col :span="24">&nbsp;</el-col>
    </el-row>
    <div class="relative">
      <el-table :data="tableData" v-loading="loadingData">
        <el-table-column fixed prop="Material" label="Material" width="150" />
        <el-table-column prop="ProductCode" label="ProductCode" />
        <el-table-column
          v-for="(item, index) in locationList"
          :key="item.Id"
          :prop="item.Id"
          :label="item.Location"
          align="center"
        >
          <template #default="scope">
            <el-input
              v-model.number="scope.row[item.Id]"
              :id="item.Id + '_' + scope.row.ProductCode"
              style="width: 100%"
              placeholder="Please input"
              type="text"
              autocomplete="off"
              :tabindex="getTabIndex(index, scope.row)"
            />
          </template>
        </el-table-column>
        <el-table-column label="Summary" align="right">
          <template #default="scope">
            {{ summaryAllLocation(scope.row) }}
          </template>
        </el-table-column>
      </el-table>
    </div>
    <el-row style="margin: 24px 0">
      <el-col :span="24">
        <div class="flex-center">
          <el-button
            @click="saveData"
            :tabindex="tableData.length * locationList.length + 1"
            size="large"
            type="primary"
            style="width: 80px; margin-left: auto"
            >Save</el-button
          >
        </div>
      </el-col>
      <el-col :span="24">&nbsp;</el-col>
    </el-row>
  </div>
</template>
