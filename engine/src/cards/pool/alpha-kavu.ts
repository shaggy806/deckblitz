import { defineCard } from "../define.js";

// EDHREC rank 30934.

export default defineCard({
  name: "Alpha Kavu",
  manaCost: "{2}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Kavu"],
  power: 2,
  toughness: 2,
  text: "{1}{G}: Target Kavu creature gets -1/+1 until end of turn.",
  activated: [
    {
      cost: { mana: "{1}{G}", tap: false },
      targets: [{ kind: "permanent", filter: { type: "creature", subtype: "Kavu" } }],
      effect: { kind: "modify-pt", target: 0, power: -1, toughness: 1, duration: "end-of-turn" },
      resolve: null,
      text: "{1}{G}: Target Kavu creature gets -1/+1 until end of turn.",
    },
  ],
});
