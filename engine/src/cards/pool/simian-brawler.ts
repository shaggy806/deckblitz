import { defineCard } from "../define.js";

// EDHREC rank 25994. Coldsnap.

export default defineCard({
  name: "Simian Brawler",
  manaCost: "{3}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Ape", "Warrior"],
  power: 3,
  toughness: 3,
  text: "Discard a land card: This creature gets +1/+1 until end of turn.",
  activated: [
    {
      cost: { mana: null, tap: false, discard: { count: 1, filter: { type: "land" } } },
      targets: [],
      effect: { kind: "modify-pt", target: "source", power: 1, toughness: 1, duration: "end-of-turn" },
      resolve: null,
      text: "Discard a land card: This creature gets +1/+1 until end of turn.",
    },
  ],
});
