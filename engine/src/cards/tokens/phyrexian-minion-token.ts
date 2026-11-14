import { defineCard } from "../define.js";

// A 0/0 black Phyrexian Minion, its size set as it's made (Phyrexian
// Processor). The art is the only Minion token printing's (TDDE's black */*
// Minion); Oracle's wording has made it a Phyrexian Minion since.
export default defineCard({
  name: "Phyrexian Minion Token (Black 0/0)",
  art: "a9930d11-4772-4fc2-abbd-9af0a9b23a3e",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Phyrexian", "Minion"],
  power: 0,
  toughness: 0,
  text: "",
});
