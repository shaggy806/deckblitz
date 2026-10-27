import { defineCard } from "../define.js";

// Prophecy. EDHREC rank 30049. The damaged creature's controller (the
// trigger's player) chooses whether to pay as the trigger resolves.

const TEXT =
  "Whenever this creature deals combat damage to a creature, you gain 2 life unless that creature's controller pays {2}.";

export default defineCard({
  name: "Soul Charmer",
  manaCost: "{2}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Human", "Rebel"],
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
        otherwise: { kind: "gain-life", amount: 2 },
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
