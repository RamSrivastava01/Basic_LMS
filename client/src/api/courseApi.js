import axiosInstance from "./axiosInstance";

export const getAllCoursesApi = async () => {
   const { data } = await axiosInstance.get("/courses", {
      withCredentials: true,
   });
   return data;
};
