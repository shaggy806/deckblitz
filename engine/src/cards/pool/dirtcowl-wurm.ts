import { defineCard } from "../define.js";

// EDHREC rank 16175.
//
// Rulings:
//   [2004-10-04] A spell or ability that tells a player to "put a land onto the battlefield" does
//     not count as playing a land. (`plays-land` is only the special action, rule 305.)

const TEXT = "Whenever an opponent plays a land, put a +1/+1 counter on this creature.";

export default defineCard({
  name: "Dirtcowl Wurm",
  manaCost: "{4}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Wurm"],
  power: 3,
  toughness: 4,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "plays-land", who: "opponent" },
      targets: [],
      effect: { kind: "add-counter", target: "source", counter: "+1/+1", amount: 1 },
      resolve: null,
      text: TEXT,
    },
  ],
});
