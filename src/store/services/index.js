import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import dayjs from "dayjs";

// Rtk query api
export const api = createApi({
  reducerPath: "schedulerApi",
  baseQuery: fetchBaseQuery({
    baseUrl: "https://6631b598c51e14d69562465b.mockapi.io",
  }),
  endpoints: (builder) => ({
    // Getting Provider's schedule
    getSchedule: builder.query({
      query: () => "/provider1",
      transformResponse: (response) => {
        return response.map(({ start, end, ...rest }) => ({
          start: dayjs(start).toDate(),
          end: dayjs(end).toDate(),
          ...rest,
        }));
      },
      providesTags: ["schedules"],
    }),
    // Create schedules to the provider
    createSchedule: builder.mutation({
      query: ({ start, end }) => {
        return {
          method: "POST",
          url: "/provider1/",
          body: {
            start,
            end,
            title: "provider1",
          },
        };
      },
      invalidatesTags: ["schedules"],
    }),
    // Delete provider's schedules
    deleteSchedule: builder.mutation({
      query: (id) => {
        return {
          method: "DELETE",
          url: `/provider1/${id}`,
        };
      },
      invalidatesTags: ["schedules"],
    }),
    // Get client's appointments
    getAppointments: builder.query({
      query: () => "/appointments",
      transformResponse: (response) => {
        return response.map(({ start, end, ...rest }) => ({
          start: dayjs(start).toDate(),
          end: dayjs(end).toDate(),
          ...rest,
        }));
      },
      providesTags: ["appointments"],
    }),
    // Create client's appointments
    createAppointment: builder.mutation({
      query: ({ start, end }) => {
        return {
          method: "POST",
          url: "/appointments",
          body: {
            start,
            end,
            color: "purple",
            title: "client",
          },
        };
      },
      invalidatesTags: ["appointments"],
    }),
    // Delete client's appointments
    deleteAppointments: builder.mutation({
      query: (id) => {
        return {
          method: "DELETE",
          url: `/appointments/${id}`,
        };
      },
      invalidatesTags: ["appointments"],
    }),
  }),
});

export const {
  useGetScheduleQuery,
  useCreateScheduleMutation,
  useLazyGetScheduleQuery,
  useLazyGetAppointmentsQuery,
  useCreateAppointmentMutation,
  useDeleteScheduleMutation,
  useDeleteAppointmentsMutation,
} = api;
