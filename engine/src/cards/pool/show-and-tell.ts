import { defineCard } from "../define.js";

// EDHREC rank 6326.
// Each player chooses in turn order from the active player, then the chosen cards enter together,
// their "as this enters" choices made first (the rulings, rule 101.4).

export default defineCard({
  name: "Show and Tell",
  manaCost: "{2}{U}",
  colors: ["U"],
  types: ["sorcery"],
  text: "Each player may put an artifact, creature, enchantment, or land card from their hand onto the battlefield.",
  effect: {
    kind: "each-player-may",
    who: "each-player",
    options: [
      {
        putFromHand: { typesAnyOf: ["artifact", "creature", "enchantment", "land"] },
        text: "Put an artifact, creature, enchantment, or land card from your hand onto the battlefield",
      },
    ],
  },
});
