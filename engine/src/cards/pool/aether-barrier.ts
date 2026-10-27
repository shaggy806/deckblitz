import { defineCard } from "../define.js";

// EDHREC rank 14495.

const TEXT =
  "Whenever a player casts a creature spell, that player sacrifices a permanent of their choice unless they pay {1}.";

export default defineCard({
  name: "Aether Barrier",
  manaCost: "{2}{U}",
  colors: ["U"],
  types: ["enchantment"],
  text: TEXT,
  triggered: [
    {
      trigger: { on: "cast-spell", who: "any", filter: { type: "creature" } },
      targets: [],
      effect: {
        kind: "unless",
        chooser: "trigger-controller",
        options: [{ pay: "{1}", text: "Pay {1}" }],
        otherwise: { kind: "sacrifice", who: "trigger-controller", filter: {}, count: 1 },
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
