import { indexSlice } from "./indexSlice";

export const borrowAPIs = indexSlice.injectEndpoints({
  endpoints: (builder) => ({
    getBorrowedBooks: builder.query({
      query: (userId) => ({
        url: `/issues/user/${userId}`,
        method: "GET",
      }),
      providesTags: ["Issue"],
    }),
    renewBook: builder.mutation({
      query: (issueId) => ({
        url: `/issues/${issueId}/renew`,
        method: "PUT",
      }),
      invalidatesTags: ["Issue"],
    }),
    getReservations: builder.query({
      query: (userId) => ({
        url: `/reservations`,
        method: "GET",
        params: { user_id: userId },
      }),
      providesTags: ["Reservation"],
    }),
    reserveBook: builder.mutation({
      query: (data) => ({
        url: "/reservations",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Reservation"],
    }),
    getFines: builder.query({
      query: (userId) => ({
        url: `/fines`,
        method: "GET",
        params: { user_id: userId },
      }),
      providesTags: ["Fine"],
    }),
    payFine: builder.mutation({
      query: (fineId) => ({
        url: `/fines/${fineId}/pay`,
        method: "PUT",
      }),
      invalidatesTags: ["Fine"],
    }),
  }),
});

export const {
  useGetBorrowedBooksQuery,
  useRenewBookMutation,
  useGetReservationsQuery,
  useReserveBookMutation,
  useGetFinesQuery,
  usePayFineMutation,
} = borrowAPIs;