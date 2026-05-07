const BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL || "http://192.168.1.4:8080/api";

export const scanTicket = async (uuid: string) => {
  try {
    const response = await fetch(`${BASE_URL}/scan-ticket`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ uuid }),
    });

    return await response.json();
  } catch (error) {
    return { status: "ERROR" };
  }
};

export const getPendingTickets = async () => {
  const res = await fetch(`${BASE_URL}/pending-tickets`);
  return res.json();
};

export const approveTicket = async (uuid: string) => {
  await fetch(`${BASE_URL}/approve-ticket`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ uuid }),
  });
};

export const rejectTicket = async (uuid: string) => {
  return fetch(`${BASE_URL}/reject-ticket`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ uuid }),
  });
};



export const getAllTickets = async () => {
  console.log("base url: ", BASE_URL);
  const res = await fetch(`${BASE_URL}/all-tickets`);
  return res.json();
};

