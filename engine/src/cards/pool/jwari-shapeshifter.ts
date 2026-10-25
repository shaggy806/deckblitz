import { defineCard } from "../define.js";

// EDHREC rank 10835.

export default defineCard({
  name: "Jwari Shapeshifter",
  manaCost: "{1}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Shapeshifter", "Ally"],
  power: 0,
  toughness: 0,
  text: "You may have this creature enter as a copy of any Ally creature on the battlefield.",
  copyOnEnter: { filter: { type: "creature", subtype: "Ally" } },
});
