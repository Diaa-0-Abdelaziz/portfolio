import ReservationsApp from "./ReservationsApp";
import "./reservations.css";

export const metadata = {
  title: "3D Restaurant Reservations",
  description: "Book restaurant tables from a live 3D floor plan with custom shapes, tables and floors.",
};

export default function ReservationsPage() {
  return <ReservationsApp />;
}
