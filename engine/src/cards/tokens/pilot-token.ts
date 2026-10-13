import { defineCard } from "../define.js";

// The Aetherdrift Pilot token (Back on Track, Cloudspire Coordinator, Country
// Roads and the other Roads, Defend the Rider, Roadside Assistance, Valor's
// Flagship): a 1/1 colorless Pilot whose crew bonus reaches saddle too
// (rules 702.122a, 702.171a). Its power itself doesn't change (the rulings).
const TEXT = "This token saddles Mounts and crews Vehicles as though its power were 2 greater.";

export default defineCard({
  name: "Pilot Token",
  art: "8672d795-04f9-4089-9c92-6d6ff628da12",
  colors: [],
  types: ["creature"],
  subtypes: ["Pilot"],
  power: 1,
  toughness: 1,
  text: TEXT,
  static: [{ affects: { scope: "self" }, crewsAs: { plus: 2, saddles: true }, text: TEXT }],
});
