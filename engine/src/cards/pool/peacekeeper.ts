import { defineCard } from "../define.js";

// Weatherlight (WTH). EDHREC rank 15851.
//
// Rulings:
//   [2008-04-01] When the ability resolves, you choose whether to sacrifice the creature or
//     perform the other action. If you can't perform the other action, then you must sacrifice the
//     creature.
//   [2008-04-01] Peacekeeper's ability doesn't cause the combat phase or the declare attackers
//     step to be skipped.
//   [2008-04-01] If the creature is no longer on the battlefield when the ability resolves, you
//     may still perform the action if you want.

const UPKEEP_TEXT = "At the beginning of your upkeep, sacrifice this creature unless you pay {1}{W}.";
const STATIC_TEXT = "Creatures can't attack.";

export default defineCard({
  name: "Peacekeeper",
  manaCost: "{2}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Human"],
  power: 1,
  toughness: 1,
  text: `${UPKEEP_TEXT}\n${STATIC_TEXT}`,
  triggered: [
    {
      trigger: { on: "step-begins", step: "upkeep", who: "you" },
      targets: [],
      effect: {
        kind: "unless",
        chooser: "you",
        options: [{ pay: "{1}{W}", text: "Pay {1}{W}" }],
        otherwise: { kind: "sacrifice-source" },
      },
      resolve: null,
      text: UPKEEP_TEXT,
    },
  ],
  static: [
    {
      affects: { scope: "filter", filter: { type: "creature" } },
      restrictions: ["cant-attack"],
      text: STATIC_TEXT,
    },
  ],
});
