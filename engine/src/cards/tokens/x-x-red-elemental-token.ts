import { defineCard } from "../define.js";

// An X/X token: its P/T is set by the `create-token` effect's `basePt`.
export default defineCard({
  name: "X/X Red Elemental Token",
  art: "fd0c9fb3-5f4c-47f9-a9b3-369d4936de60",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Elemental"],
  power: 0,
  toughness: 0,
});
