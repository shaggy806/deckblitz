import { defineCard } from "../define.js";
import { crew } from "../helpers.js";

// Mu Yanling, Wind Rider's Vehicle token: a 3/2 colorless Vehicle artifact
// token with crew 1.

export default defineCard({
  name: "Vehicle Token",
  art: "a3803365-ed78-409f-8ca5-7aa3634faf76",
  colors: [],
  types: ["artifact"],
  subtypes: ["Vehicle"],
  power: 3,
  toughness: 2,
  text: "Crew 1 (Tap any number of creatures you control with total power 1 or more: This token becomes an artifact creature until end of turn.)",
  activated: [crew(1)],
});
