import { defineCard } from "../define.js";

// Lorwyn (LRW). EDHREC rank 20346.
const TEXT = "Whenever this creature attacks, it gets +1/+1 until end of turn for each other attacking Kithkin.";

export default defineCard({
  name: "Cenn's Heir",
  manaCost: "{1}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Kithkin", "Soldier"],
  power: 1,
  toughness: 1,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "attacks", who: "self" },
      targets: [],
      effect: {
        kind: "modify-pt",
        target: "source",
        power: { countOf: { type: "creature", subtype: "Kithkin", attacking: true }, excludeSelf: true },
        toughness: { countOf: { type: "creature", subtype: "Kithkin", attacking: true }, excludeSelf: true },
        duration: "end-of-turn",
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
