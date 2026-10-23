import { defineCard } from "../define.js";

const TEXT = "Discard a card: This creature gets +2/-2 until end of turn.";

export default defineCard({
  name: "Ravenous Bloodseeker",
  manaCost: "{1}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Vampire", "Berserker"],
  power: 1,
  toughness: 3,
  text: TEXT,
  activated: [
    {
      cost: { mana: null, tap: false, discard: { count: 1 } },
      targets: [],
      effect: { kind: "modify-pt", target: "source", power: 2, toughness: -2, duration: "end-of-turn" },
      resolve: null,
      text: TEXT,
    },
  ],
});
