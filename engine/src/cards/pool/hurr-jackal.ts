import { defineCard } from "../define.js";

// EDHREC rank 30928.

export default defineCard({
  name: "Hurr Jackal",
  manaCost: "{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Jackal"],
  power: 1,
  toughness: 1,
  text: "{T}: Target creature can't be regenerated this turn.",
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: ["creature"],
      effect: { kind: "prohibit", target: 0, regeneration: true },
      resolve: null,
      text: "{T}: Target creature can't be regenerated this turn.",
    },
  ],
});
