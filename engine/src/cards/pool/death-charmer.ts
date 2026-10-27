import { defineCard } from "../define.js";

// Prophecy (PCY). EDHREC rank 29115.
//
// Flayed Nim's trigger: "that creature's controller" is the trigger player, who chooses
// whether to pay as it resolves (Isolation Cell's punisher).

const TEXT =
  "Whenever this creature deals combat damage to a creature, that creature's controller loses 2 life unless they pay {2}.";

export default defineCard({
  name: "Death Charmer",
  manaCost: "{2}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Worm", "Mercenary"],
  power: 2,
  toughness: 2,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "deals-damage", who: "self", to: "creature", combat: true },
      targets: [],
      effect: {
        kind: "unless",
        chooser: "trigger-player",
        options: [{ pay: "{2}", text: "Pay {2}" }],
        otherwise: { kind: "lose-life", amount: 2, who: "trigger-player" },
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
