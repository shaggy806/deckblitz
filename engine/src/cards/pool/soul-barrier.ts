import { defineCard } from "../define.js";

// EDHREC rank 18000. "That player" is the spell's caster — the trigger
// object's controller — who chooses whether to pay.
export default defineCard({
  name: "Soul Barrier",
  manaCost: "{2}{U}",
  colors: ["U"],
  types: ["enchantment"],
  text: "Whenever an opponent casts a creature spell, this enchantment deals 2 damage to that player unless they pay {2}.",
  triggered: [
    {
      trigger: { on: "cast-spell", who: "opponent", filter: { type: "creature" } },
      targets: [],
      effect: {
        kind: "unless",
        chooser: "trigger-controller",
        options: [{ pay: "{2}", text: "Pay {2}" }],
        otherwise: { kind: "damage", amount: 2, who: "trigger-controller" },
      },
      resolve: null,
      text: "Whenever an opponent casts a creature spell, this enchantment deals 2 damage to that player unless they pay {2}.",
    },
  ],
});
