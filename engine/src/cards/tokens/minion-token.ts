import { defineCard } from "../define.js";

// A 1/1 black Minion (Infernal Genesis). Never printed as a 1/1 token: the art
// is the only Minion token printing's (TDDE's black */* Minion).
export default defineCard({
  name: "Minion Token",
  art: "a9930d11-4772-4fc2-abbd-9af0a9b23a3e",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Minion"],
  power: 1,
  toughness: 1,
  text: "",
});
