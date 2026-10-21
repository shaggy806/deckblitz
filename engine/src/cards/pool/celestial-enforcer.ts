import { defineCard } from "../define.js";

// Rulings:
//   [2020-06-23] Once you begin activating Celestial Enforcer's ability, players can't take any
//     other actions until you're done activating it.

export default defineCard({
  name: "Celestial Enforcer",
  manaCost: "{2}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Human", "Cleric"],
  power: 2,
  toughness: 3,
  text: "{1}{W}, {T}: Tap target creature. Activate only if you control a creature with flying.",
  activated: [
    {
      cost: { mana: "{1}{W}", tap: true },
      condition: { kind: "controls", filter: { type: "creature", keyword: "flying" }, atLeast: 1 },
      targets: ["creature"],
      effect: { kind: "tap", target: 0 },
      resolve: null,
      text: "{1}{W}, {T}: Tap target creature. Activate only if you control a creature with flying.",
    },
  ],
});
