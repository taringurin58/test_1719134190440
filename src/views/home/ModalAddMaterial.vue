<script lang="ts" setup>
import { ref, computed } from "vue";
import { Search, Plus } from "@element-plus/icons-vue";
import { ElMessageBox } from "element-plus";
import { ElNotification } from "element-plus";

import { homeStore, type materialDetailType } from "@/stores/home";
const store = homeStore();
const materialInput = ref<string>("");
const addModalStatus = ref<boolean>(false);
const materialDetail = ref<materialDetailType>({
  Material: "",
  ProductCode: "",
  Description: "",
});
const loadingMaterialDetail = computed(() => store.loadingMaterialDetail);

const handleClose = (done: () => void) => {
  if (loadingMaterialDetail.value) {
    return;
  }
  if (
    materialDetail.value.Material ||
    materialDetail.value.ProductCode ||
    materialDetail.value.Description
  ) {
    ElMessageBox.confirm("Are you sure to discard changes?", "Warning", {
      confirmButtonText: "Yes",
      cancelButtonText: "No",
      type: "warning",
    }).then(() => {
      done();
      clearMeterialDetail();
    });
  } else {
    done();
  }
};

const clearMeterialDetail = () => {
  materialDetail.value = {
    Material: "",
    ProductCode: "",
    Description: "",
  };
  materialInput.value = "";
};

const addNewMeterial = () => {
  const materialListUnique = store.materialListUnique;
  const isExist = materialListUnique.includes(
    `${materialDetail.value.Material}___${materialDetail.value.ProductCode}`
  );
  if (isExist) {
    ElNotification({
      title: "Error",
      message: "Material is exist",
      type: "error",
    });
    return;
  }
  store.addNewMateriaToState(materialDetail.value);
  addModalStatus.value = false;
  clearMeterialDetail();
};

const seachMeterial = async () => {
  try {
    const res = await store.getMaterialDetail(materialInput.value);
    materialDetail.value = res;
  } catch (error) {
    clearMeterialDetail();
  }
};
</script>

<template>
  <el-button
    @click="addModalStatus = true"
    size="large"
    type="primary"
    style="width: 80px; margin-left: auto"
    :icon="Plus"
  ></el-button>
  <el-dialog
    v-model="addModalStatus"
    title="Add Material"
    width="500"
    :before-close="handleClose"
  >
    <div class="text-left">
      <el-row>
        <el-col :span="8">
          <div style="margin-top: 6px">Material:</div>
        </el-col>
        <el-col :span="13">
          <el-input v-model="materialInput" placeholder="Search Material" />
        </el-col>
        <el-col :span="3">
          <el-button
            @click="seachMeterial"
            type="primary"
            style="margin-left: 6px"
            :icon="Search"
            :loading="loadingMaterialDetail"
            :disabled="loadingMaterialDetail"
          ></el-button>
        </el-col>
      </el-row>
      <el-row style="margin-top: 12px">
        <el-col :span="8">Product Code:</el-col>
        <el-col :span="16">
          {{ materialDetail.ProductCode }}
        </el-col>
      </el-row>
      <el-row style="margin-top: 12px">
        <el-col :span="8">Description:</el-col>
        <el-col :span="16">
          <div style="min-height: 44px">
            {{ materialDetail.Description }}
          </div>
        </el-col>
      </el-row>
    </div>
    <template #footer>
      <div class="dialog-footer">
        <el-button
          type="primary"
          @click="addNewMeterial"
          :disabled="loadingMaterialDetail || !materialDetail.ProductCode"
          >Add
        </el-button>
        <el-button @click="addModalStatus = false">Cancel</el-button>
      </div>
    </template>
  </el-dialog>
</template>

<style></style>
