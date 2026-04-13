import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getUsersRequest, createUserRequest } from "../api/users.api";

// React Query handles caching, loading states, and refetching for us
// useQueryClient lets us manually invalidate (refresh) cached data

export function useUsers() {
  const queryClient = useQueryClient();

  // FETCH USERS
  // "users" is the cache key — React Query uses this to store/retrieve data
  const {
    data,
    isLoading: usersLoading,
    error: usersError,
  } = useQuery({
    queryKey: ["users"],
    queryFn: getUsersRequest,
    // Only fetch if we have a tenantUUID stored (i.e. user is logged in)
    enabled: !!localStorage.getItem("tenantUUID"),
  });

  // CREATE USER (admin only)
  const {
    mutateAsync: createUser,
    isPending: createLoading,
    error: createError,
  } = useMutation({
    mutationFn: createUserRequest,
    // After creating a user, invalidate the "users" cache
    // so the list automatically refetches with the new user
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
  });

  return {
    // users is nested inside data.data because backend returns { success, data: [...] }
    users: data?.data || [],
    usersLoading,
    usersError,
    createUser,
    createLoading,
    createError,
  };
}
