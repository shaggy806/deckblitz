import { defineCard } from "../define.js";

// Stronghold (STH). EDHREC rank 12330.
//
// Rulings:
//   [2014-07-18] Wall of Essence's triggered ability will trigger even if it's dealt lethal
//     damage. For example, if it's dealt 7 combat damage, its ability will trigger and you'll gain
//     7 life.
//
// Metropolis Reformer's shape, narrowed to combat damage (`combat: true`).

const TEXT = "Whenever this creature is dealt combat damage, you gain that much life.";

export default defineCard({
  name: "Wall of Essence",
  manaCost: "{1}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Wall"],
  power: 0,
  toughness: 4,
  keywords: ["defender"],
  text: `Defender (This creature can't attack.)\n${TEXT}`,
  triggered: [
    {
      trigger: { on: "dealt-damage", who: "self", combat: true },
      targets: [],
      effect: { kind: "gain-life", amount: { triggerValue: true } },
      resolve: null,
      text: TEXT,
    },
  ],
});
