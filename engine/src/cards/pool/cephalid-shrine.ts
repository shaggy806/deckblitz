import { defineCard } from "../define.js";

// EDHREC rank 30458.

export default defineCard({
  name: "Cephalid Shrine",
  manaCost: "{1}{U}{U}",
  colors: ["U"],
  types: ["enchantment"],
  text: "Whenever a player casts a spell, counter that spell unless that player pays {X}, where X is the number of cards in all graveyards with the same name as the spell.",
  triggered: [
    {
      trigger: { on: "cast-spell", who: "any" },
      targets: [],
      effect: {
        kind: "unless",
        chooser: "trigger-controller",
        options: [{ payGeneric: { countInGraveyard: { sameNameAsTriggerObject: true } }, text: "Pay {X}" }],
        otherwise: { kind: "counter", target: "trigger-object" },
      },
      resolve: null,
      text: "Whenever a player casts a spell, counter that spell unless that player pays {X}, where X is the number of cards in all graveyards with the same name as the spell.",
    },
  ],
});
