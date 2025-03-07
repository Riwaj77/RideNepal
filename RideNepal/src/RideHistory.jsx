import React, { useState } from "react";
import { Search } from "lucide-react";
import "./RideHistory.css";

const mockRides = [
  {
    id: 1,
    date: "2025-01-15",
    time: "14:30",
    pickup: "Naxal",
    dropoff: "Jhamsikhel",
    cost: 140,
    status: "completed",
  },
  {
    id: 2,
    date: "2024-01-14",
    time: "09:15",
    pickup: "Naxal",
    dropoff: "Jhamsikhel",
    cost: 140,
    status: "cancelled",
  },
  {
    id: 3,
    date: "2024-01-14",
    time: "18:45",
    pickup: "Naxal",
    dropoff: "Jhamsikhel",
    cost: 140,
    status: "completed",
  },
];

export default function RideHistory() {
  const [searchTerm, setSearchTerm] = useState("");
  const [rides, setRides] = useState(mockRides);
  const filteredRides = rides.filter(
    (ride) =>
      ride.pickup.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ride.dropoff.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="rh_ride-history">
      <div className="rh_ride-history-header">
        <h1>Ride History</h1>
        <div className="rh_search-bar">
          <Search size={20} />
          <input
            type="text"
            placeholder="Search by location..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>
      <div className="rh_rides-list">
        {filteredRides.map((ride) => (
          <div key={ride.id} className={`rh_ride-item ${ride.status}`}>
            <div className="rh_ride-main-info">
              <div className="rh_ride-locations">
                <div>
                  {ride.pickup} → {ride.dropoff}
                </div>
              </div>
              <div className="rh_ride-cost">Rs.{ride.cost.toFixed(2)}</div>
            </div>
            <div className="rh_ride-secondary-info">
              <div className="rh_ride-datetime">
                {ride.date} at {ride.time}
              </div>
              <div className="rh_ride-status">{ride.status}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
