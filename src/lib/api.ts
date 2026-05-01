const API_BASE_URL =
  (typeof process !== "undefined" ? process.env.NEXT_PUBLIC_API_URL : undefined) ||
  (typeof process !== "undefined" ? process.env.NEXT_PUBLIC_API_BASE_URL : undefined) ||
  (typeof import.meta !== "undefined" ? (import.meta as any).env?.VITE_API_BASE_URL : undefined) ||
  "http://localhost:3000/api";

export async function registerUser(payload: {
  fullname: string;
  email: string;
  phone: string;
  password: string;
  role: "passenger" | "driver";
}) {
  const res = await fetch(`${API_BASE_URL}/users/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data?.message || "Registration failed");
  }
  return data; // { message, user }
}
// login
export async function loginUser(payload:{
  email:string,
  password:string
}){
  const res = await fetch(`${API_BASE_URL}/users/login`,{
    method:'POST',
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  })
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data?.message || "Login failed");
  }
  return data; // { message, user }
}