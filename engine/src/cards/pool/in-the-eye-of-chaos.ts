import { defineCard } from "../define.js";

// EDHREC rank 21498. A world enchantment (the world rule, 704.5k). X is the
// spell's mana value as this resolves; its controller decides whether to pay.

const TEXT = "Whenever a player casts an instant spell, counter it unless that player pays {X}, where X is its mana value.";

export default defineCard({
  name: "In the Eye of Chaos",
  manaCost: "{2}{U}",
  colors: ["U"],
  supertypes: ["world"],
  types: ["enchantment"],
  text: TEXT,
  triggered: [
    {
      trigger: { on: "cast-spell", who: "any", filter: { type: "instant" } },
      targets: [],
      effect: {
        kind: "unless",
        chooser: "trigger-controller",
        options: [{ payGeneric: { manaValueOf: "trigger-object" }, text: "Pay {X}" }],
        otherwise: { kind: "counter", target: "trigger-object" },
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
