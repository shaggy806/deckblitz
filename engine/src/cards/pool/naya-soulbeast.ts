import { defineCard } from "../define.js";

// Rulings:
//   [2013-10-17] Naya Soulbeast's last ability triggers while Naya Soulbeast is on the stack. After
//     that ability resolves, players will be able to cast spells and activate abilities knowing how
//     many counters Naya Soulbeast will enter the battlefield with if it resolves.
const CAST_TEXT =
  "When you cast this spell, each player reveals the top card of their library. This creature enters with X +1/+1 counters on it, where X is the total mana value of all cards revealed this way.";

export default defineCard({
  name: "Naya Soulbeast",
  manaCost: "{6}{G}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Beast"],
  power: 0,
  toughness: 0,
  keywords: ["trample"],
  text: `${CAST_TEXT}\nTrample`,
  triggered: [
    {
      trigger: { on: "this-cast" },
      targets: [],
      effect: {
        kind: "reveal-top",
        who: "each-player",
        then: {
          kind: "enters-with-counters",
          target: "source",
          counter: "+1/+1",
          amount: { thisWay: "revealed", sumOf: "mana-value" },
        },
      },
      resolve: null,
      text: CAST_TEXT,
    },
  ],
});
