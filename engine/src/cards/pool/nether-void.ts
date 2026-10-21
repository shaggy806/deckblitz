import { defineCard } from "../define.js";

// EDHREC rank 16318. A world enchantment (the world rule, 704.5k). The
// spell's controller decides whether to pay {3} as this resolves.

const TEXT = "Whenever a player casts a spell, counter it unless that player pays {3}.";

export default defineCard({
  name: "Nether Void",
  manaCost: "{3}{B}",
  colors: ["B"],
  supertypes: ["world"],
  types: ["enchantment"],
  text: TEXT,
  triggered: [
    {
      trigger: { on: "cast-spell", who: "any" },
      targets: [],
      effect: {
        kind: "unless",
        chooser: "trigger-controller",
        options: [{ pay: "{3}", text: "Pay {3}" }],
        otherwise: { kind: "counter", target: "trigger-object" },
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
