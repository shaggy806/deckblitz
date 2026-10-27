import { defineCard } from "../define.js";

// EDHREC rank 26965.

export default defineCard({
  name: "Patrol Hound",
  manaCost: "{1}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Dog"],
  power: 2,
  toughness: 2,
  text: "Discard a card: This creature gains first strike until end of turn.",
  activated: [
    {
      cost: { mana: null, tap: false, discard: { count: 1 } },
      targets: [],
      effect: { kind: "grant-keyword", target: "source", keyword: "first-strike", duration: "end-of-turn" },
      resolve: null,
      text: "Discard a card: This creature gains first strike until end of turn.",
    },
  ],
});
