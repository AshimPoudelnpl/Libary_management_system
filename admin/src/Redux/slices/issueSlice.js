import { indexSlice } from "./indexSlice";

export const issueAPIs = indexSlice.injectEndpoints({
  endpoints: (builder) => ({
    getIssuedBooks: builder.query({
      query: (params) => ({
        url: "/issues",
        method: "GET",
        params,
      }),
      providesTags: ["Issue"],
    }),
    getIssueById: builder.query({
      query: (id) => ({
        url: `/issues/${id}`,
        method: "GET",
      }),
      providesTags: (result, error, id) => [{ type: "Issue", id }],
    }),
    getIssuesByUser: builder.query({
      query: (userId) => ({
        url: `/issues/user/${userId}`,
        method: "GET",
      }),
      providesTags: ["Issue"],
    }),
    issueBook: builder.mutation({
      query: (data) => ({
        url: "/issues",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Issue", "Book"],
    }),
    returnBook: builder.mutation({
      query: (id) => ({
        url: `/issues/${id}/return`,
        method: "PUT",
      }),
      invalidatesTags: ["Issue", "Book"],
    }),
  }),
});

export const {
  useGetIssuedBooksQuery,
  useGetIssueByIdQuery,
  useGetIssuesByUserQuery,
  useIssueBookMutation,
  useReturnBookMutation,
} = issueAPIs;