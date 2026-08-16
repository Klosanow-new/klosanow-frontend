import { BaseAxiosInstance as Axios } from "../../utils/axios";
import { pushSubscribeRoute, vapidPublicKeyRoute } from "src/data/apiUrl";
import { PushSubscriptionPayload } from "src/types";

// Auth headers are attached by the BaseAxiosInstance request interceptor.

export const getVapidPublicKey = async (): Promise<string> => {
  const { data } = await Axios.get(vapidPublicKeyRoute);

  // Tolerate the common response shapes until the backend contract is pinned.
  return data?.publicKey || data?.vapidPublicKey || data?.data?.publicKey || data;
};

export const savePushSubscription = async (body: PushSubscriptionPayload) => {
  const { data } = await Axios.post(pushSubscribeRoute, body);
  return data;
};

export const deletePushSubscription = async (endpoint: string) => {
  // DELETE with a body — axios requires it under the `data` key.
  const { data } = await Axios.delete(pushSubscribeRoute, {
    data: { endpoint },
  });
  return data;
};
