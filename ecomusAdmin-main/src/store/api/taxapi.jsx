import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'

export const taxApi = createApi({
  reducerPath: 'taxApi',
  baseQuery: fetchBaseQuery({ baseUrl: 'http://localhost:8000/api/' }),
  tagTypes: ['Tax'],
  endpoints: (builder) => ({
    getTaxes: builder.query({
      query: (all = true) => ({
        url: all ? 'tax?all=true' : 'tax',
        method: 'GET',
      }),
      providesTags: (result) =>
        result?.data
          ? [
            ...result.data.map((tax) => ({ type: 'Tax', id: tax._id })),
            { type: 'Tax', id: 'LIST' },
          ]
          : [{ type: 'Tax', id: 'LIST' }],
    }),
    createTax: builder.mutation({
      query: (body) => ({
        url: 'tax',
        method: 'POST',
        body,
      }),
      invalidatesTags: [{ type: 'Tax', id: 'LIST' }],
    }),
    updateTax: builder.mutation({
      query: ({ id, data }) => ({
        url: `tax/${id}`,
        method: 'PATCH',
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: 'Tax', id },
        { type: 'Tax', id: 'LIST' },
      ],
    }),
  }),
})

export const { useGetTaxesQuery, useCreateTaxMutation, useUpdateTaxMutation } = taxApi
