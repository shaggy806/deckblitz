import { defineCard } from "../define.js";

// EDHREC rank 1394.
//
// Rulings:
//   All Will Be One's ability will trigger any time you put one or more counters on a permanent or
//     player. This might be due to a spell or ability resolving, a permanent you control entering
//     the battlefield with counters, or combat damage from a source with toxic.
//   If more than one creature with toxic deals combat damage to a player at the same time, those
//     counters are placed as a single event, and the ability triggers one time.
const TEXT =
  "Whenever you put one or more counters on a permanent or player, this enchantment deals that much damage to target opponent, creature an opponent controls, or planeswalker an opponent controls.";

export default defineCard({
  name: "All Will Be One",
  manaCost: "{3}{R}{R}",
  colors: ["R"],
  types: ["enchantment"],
  text: TEXT,
  triggered: [
    {
      trigger: { on: "counters-put", who: "any", byYou: true, orPlayer: true },
      targets: [
        {
          kind: "one-of",
          of: ["opponent", { kind: "permanent", whose: "opponent", filter: { typesAnyOf: ["creature", "planeswalker"] } }],
        },
      ],
      effect: { kind: "damage", amount: { triggerValue: true }, target: 0 },
      resolve: null,
      text: TEXT,
    },
  ],
});
