import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
export const contactApi = createApi({
  reducerPath: 'contactApi',
  baseQuery: fetchBaseQuery({ baseUrl: "http://localhost:8000/api", prepareHeaders: (headers, { getState }) => {
    const token = localStorage.getItem('ecomustoken'); // Retrieve the token from local storage
    if (token) {
      headers.set('Authorization', `Bearer ${token}`);
    }
    return headers;
  },}),
  endpoints: (builder) => ({
    postContact: builder.mutation({
        query: (data) => ({
          url: `/contactus`,
          method:'POST',
          body:data
        })
      }),
  }),
})

export const { usePostContactMutation } = contactApi