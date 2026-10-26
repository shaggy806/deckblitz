import { defineCard } from "../define.js";

// Portal. EDHREC rank 31774.
//
// "Black and/or red": a creature of either colour or both — `anyOf`, since a
// `colors` list asks for every colour in it.
export default defineCard({
  name: "Sacred Knight",
  manaCost: "{3}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Human", "Knight"],
  power: 3,
  toughness: 2,
  text: "This creature can't be blocked by black and/or red creatures.",
  static: [
    {
      affects: { scope: "self" },
      cantBeBlockedBy: { anyOf: [{ colors: ["B"] }, { colors: ["R"] }] },
      text: "This creature can't be blocked by black and/or red creatures.",
    },
  ],
});
