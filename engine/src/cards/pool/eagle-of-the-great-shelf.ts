import { defineCard } from "../define.js";

// EDHREC rank 20731.
//
// Muxus, Goblin Grandee's attack pump, counted as it resolves.

const TEXT = "Whenever this creature attacks, it gets +1/+1 until end of turn for each other creature you control.";

export default defineCard({
  name: "Eagle of the Great Shelf",
  manaCost: "{4}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Bird", "Soldier"],
  power: 2,
  toughness: 5,
  keywords: ["flying"],
  text: `Flying\n${TEXT}`,
  triggered: [
    {
      trigger: { on: "attacks", who: "self" },
      targets: [],
      effect: {
        kind: "modify-pt",
        target: "source",
        power: { countOf: { type: "creature", controlledBy: "you" }, excludeSelf: true },
        toughness: { countOf: { type: "creature", controlledBy: "you" }, excludeSelf: true },
        duration: "end-of-turn",
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
