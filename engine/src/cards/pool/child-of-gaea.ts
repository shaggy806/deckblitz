import { defineCard } from "../define.js";

// Urza's Saga (USG). EDHREC rank 30348.
//
// Rulings:
//   [2004-10-04] You choose whether to pay or not on resolution. If not, then you sacrifice Child
//     of Gaea. You can choose to not pay even if you no longer control Child of Gaea on
//     resolution.
//   [2009-10-01] If you do choose not to pay, but no longer control Child of Gaea, you cannot
//     sacrifice. It will remain on the battlefield under its current controller's control.

const UPKEEP_TEXT = "At the beginning of your upkeep, sacrifice this creature unless you pay {G}{G}.";

export default defineCard({
  name: "Child of Gaea",
  manaCost: "{3}{G}{G}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Elemental"],
  power: 7,
  toughness: 7,
  keywords: ["trample"],
  text: `Trample\n${UPKEEP_TEXT}\n{1}{G}: Regenerate this creature.`,
  activated: [
    {
      cost: { mana: "{1}{G}", tap: false },
      targets: [],
      effect: { kind: "regenerate", target: "source" },
      resolve: null,
      text: "{1}{G}: Regenerate this creature.",
    },
  ],
  triggered: [
    {
      trigger: { on: "step-begins", step: "upkeep", who: "you" },
      targets: [],
      effect: { kind: "unless", chooser: "you", options: [{ pay: "{G}{G}", text: "Pay {G}{G}" }], otherwise: { kind: "sacrifice-source" } },
      resolve: null,
      text: UPKEEP_TEXT,
    },
  ],
});
