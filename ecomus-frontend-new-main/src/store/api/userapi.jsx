import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
export const userApi = createApi({
  reducerPath: 'userApi',
  tagTypes: ['User'],
  baseQuery: fetchBaseQuery({
    baseUrl: "http://localhost:8000/api/user", prepareHeaders: (headers, { getState }) => {
      const tokenData = localStorage.getItem('ecomustoken'); // Retrieve the token from local storage
      if (tokenData) {
        try {
          const parsedData = JSON.parse(tokenData);
          const token = parsedData.token || tokenData;
          headers.set('Authorization', `Bearer ${token}`);
        } catch (e) {
          // If parsing fails, use as-is
          headers.set('Authorization', `Bearer ${tokenData}`);
        }
      }
      return headers;
    },
  }),
  endpoints: (builder) => ({
    getUserInfo: builder.query({
      query: () => ({
        url: `/userinfo`,
        method: 'GET'
      }),
      providesTags: ['User'],
    }),
    postCreateUser: builder.mutation({
      query: (data) => ({
        url: `/register`,
        method: 'POST',
        body: data
      }),
      invalidatesTags: ['User'],
    }),
    postLoginUser: builder.mutation({
      query: (data) => ({
        url: `/login`,
        method: 'POST',
        body: data
      }),
      invalidatesTags: ['User'],
    }),
    postGoogleAuth: builder.mutation({
      query: (data) => ({
        url: `/google`,
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['User'],
    }),
    patchUser: builder.mutation({
      query: (data) => ({
        url: `/`,
        method: 'PATCH',
        body: data
      }),
      invalidatesTags: ['User'],
    }),
  }),
})

export const {
  useGetUserInfoQuery,
  usePostCreateUserMutation,
  usePostLoginUserMutation,
  usePostGoogleAuthMutation,
  usePatchUserMutation,
} = userApi