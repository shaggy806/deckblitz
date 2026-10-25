import { defineCard } from "../define.js";
import { PARLEY_NONLAND, parley } from "../helpers.js";

// Conspiracy (CNS). EDHREC rank 26677.
//
// The creatures attacking as it resolves get the bonus, locked in then
// (rule 611.2c).
export default defineCard({
  name: "Woodvine Elemental",
  manaCost: "{4}{G}{W}",
  colors: ["W", "G"],
  types: ["creature"],
  subtypes: ["Elemental"],
  power: 4,
  toughness: 4,
  keywords: ["trample"],
  text: "Trample\nParley — Whenever this creature attacks, each player reveals the top card of their library. For each nonland card revealed this way, attacking creatures you control get +1/+1 until end of turn. Then each player draws a card.",
  triggered: [
    {
      trigger: { on: "attacks", who: "self" },
      targets: [],
      effect: parley({
        kind: "modify-pt-all",
        filter: { type: "creature", attacking: true, controlledBy: "you" },
        power: PARLEY_NONLAND,
        toughness: PARLEY_NONLAND,
        duration: "end-of-turn",
      }),
      resolve: null,
      text: "Parley — Whenever this creature attacks, each player reveals the top card of their library. For each nonland card revealed this way, attacking creatures you control get +1/+1 until end of turn. Then each player draws a card.",
    },
  ],
});
