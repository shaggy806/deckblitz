import { defineCard } from "../define.js";

// Coldsnap (CSP). EDHREC rank 25542.
//
// Rulings:
//   [2006-07-15] If a permanent is enchanted with an Aura such as Confiscate when Brooding
//     Saurian's ability resolves, the enchanted permanent's owner will regain control of it. The
//     Aura will not be removed. The Aura will still be controlled by its owner, but its effect
//     will be overridden.

const TEXT = "At the beginning of each end step, each player gains control of all nontoken permanents they own.";

export default defineCard({
  name: "Brooding Saurian",
  manaCost: "{2}{G}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Lizard"],
  power: 4,
  toughness: 4,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "step-begins", step: "end", who: "any" },
      targets: [],
      effect: { kind: "gain-control-all", filter: { token: false }, untilEndOfTurn: false, who: "owner" },
      resolve: null,
      text: TEXT,
    },
  ],
});
