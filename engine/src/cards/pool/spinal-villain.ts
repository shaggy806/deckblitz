import { defineCard } from "../define.js";

export default defineCard({
  name: "Spinal Villain",
  manaCost: "{2}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Beast"],
  power: 1,
  toughness: 2,
  text: "{T}: Destroy target blue creature.",
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: [{ kind: "permanent", filter: { colors: ["U"], type: "creature" } }],
      effect: { kind: "destroy", target: 0 },
      resolve: null,
      text: "{T}: Destroy target blue creature.",
    },
  ],
});
