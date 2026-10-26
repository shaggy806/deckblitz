import { defineCard } from "../define.js";

// EDHREC rank 3739.

export default defineCard({
  name: "Redress Fate",
  manaCost: "{6}{W}{W}",
  colors: ["W"],
  types: ["sorcery"],
  miracle: { cost: "{3}{W}" },
  text: "Return all artifact and enchantment cards from your graveyard to the battlefield.\nMiracle {3}{W} (You may cast this card for its miracle cost when you draw it if it's the first card you drew this turn.)",
  effect: {
    kind: "return-from-graveyard",
    filter: { typesAnyOf: ["artifact", "enchantment"] },
    destination: "battlefield",
    count: "all",
  },
});
