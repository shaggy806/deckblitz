import { defineCard } from "../define.js";

// A 4/4 red and green Beast creature token with trample (Thrash // Threat).

export default defineCard({
  name: "Beast Token (Red-Green)",
  art: "33521793-69f2-4a95-a4da-d28add4e5e93",
  colors: ["R", "G"],
  types: ["creature"],
  subtypes: ["Beast"],
  power: 4,
  toughness: 4,
  keywords: ["trample"],
  text: "Trample",
});
