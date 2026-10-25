import { defineCard } from "../define.js";

// EDHREC rank 17959.
//
// The Vampires are the ones you control as it resolves (the first ruling).

const TEXT = "Discard a card: Vampires you control get +1/+1 until end of turn. Activate only once each turn.";

export default defineCard({
  name: "Stromkirk Condemned",
  manaCost: "{B}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Vampire", "Horror"],
  power: 2,
  toughness: 2,
  text: TEXT,
  activated: [
    {
      cost: { mana: null, tap: false, discard: { count: 1 } },
      targets: [],
      effect: {
        kind: "modify-pt-all",
        filter: { type: "creature", subtype: "Vampire", controlledBy: "you" },
        power: 1,
        toughness: 1,
        duration: "end-of-turn",
      },
      oncePerTurn: true,
      resolve: null,
      text: TEXT,
    },
  ],
});
