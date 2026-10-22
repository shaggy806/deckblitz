import { defineCard } from "../define.js";

// A 0/1 white Caribou — Caribou Range's token (ICE). No token printing exists.
export default defineCard({
  name: "Caribou Token",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Caribou"],
  power: 0,
  toughness: 1,
});
