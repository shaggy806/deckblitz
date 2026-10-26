import { defineCard } from "../define.js";

// EDHREC rank 12698. Soul Barrier's shape: "that player" is the spell's
// caster, who chooses whether to pay.
const TEXT = "Whenever an opponent casts a creature spell, that player loses 2 life unless they pay {2}.";

export default defineCard({
  name: "Isolation Cell",
  manaCost: "{4}",
  colors: [],
  types: ["artifact"],
  text: TEXT,
  triggered: [
    {
      trigger: { on: "cast-spell", who: "opponent", filter: { type: "creature" } },
      targets: [],
      effect: {
        kind: "unless",
        chooser: "trigger-controller",
        options: [{ pay: "{2}", text: "Pay {2}" }],
        otherwise: { kind: "lose-life", amount: 2, who: "trigger-controller" },
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
