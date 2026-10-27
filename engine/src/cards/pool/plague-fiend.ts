import { defineCard } from "../define.js";

// Prophecy. EDHREC rank 26156. The damaged creature's controller (the
// trigger's player) gets the option to pay as the trigger resolves (the
// ruling); Stinkweed Imp's destroy otherwise.

const TEXT =
  "Whenever this creature deals combat damage to a creature, destroy that creature unless its controller pays {2}.";

export default defineCard({
  name: "Plague Fiend",
  manaCost: "{1}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Insect"],
  power: 1,
  toughness: 1,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "deals-damage", who: "self", to: "creature", combat: true },
      targets: [],
      effect: {
        kind: "unless",
        chooser: "trigger-player",
        options: [{ pay: "{2}", text: "Pay {2}" }],
        otherwise: { kind: "destroy", target: "trigger-recipient" },
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
