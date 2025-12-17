import { redirect } from "next/navigation";

export default function Player() {
  // Redirect to the main app since player requires an ID
  redirect("/");
}
