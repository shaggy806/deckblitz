import { defineCard } from "../define.js";

// EDHREC rank 27352. "Any player may pay {1}. If no one does, …" is the
// rhystic `unless` (`chooser: "any-player"`); what follows is Haazda Shield
// Mate's chosen-source prevention, chosen as it resolves.

const TEXT =
  "{1}: Any player may pay {1}. If no one does, the next time a source of your choice would deal damage to you this turn, prevent that damage.";

export default defineCard({
  name: "Rhystic Circle",
  manaCost: "{2}{W}{W}",
  colors: ["W"],
  types: ["enchantment"],
  text: TEXT,
  activated: [
    {
      cost: { mana: "{1}", tap: false },
      targets: [],
      effect: {
        kind: "unless",
        chooser: "any-player",
        options: [{ pay: "{1}", text: "Pay {1}" }],
        otherwise: { kind: "prevent-damage-from-chosen-source", to: "you", amount: "next-time" },
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
