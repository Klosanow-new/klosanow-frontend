// Shape the backend's POST /subscribe expects — the browser's
// PushSubscription.toJSON() output, flattened to the fields the server stores.
export interface PushSubscriptionPayload {
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
}

// Payload carried on the `new-message` socket event.
export interface NewMessagePayload {
  _id?: string;
  chatId?: string;
  studyChatId?: string;
  text?: string;
  message?: string;
  sender?: {
    _id?: string;
    firstName?: string;
    lastName?: string;
    photoUrl?: string;
  };
  createdAt?: string;
}
