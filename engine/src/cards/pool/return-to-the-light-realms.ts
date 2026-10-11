import { defineCard } from "../define.js";

// EDHREC rank 13719.

export default defineCard({
  name: "Return to the Light Realms",
  manaCost: "{7}{W}{W}",
  colors: ["W"],
  types: ["sorcery"],
  text: "Return all nonland permanent cards from your graveyard to the battlefield.",
  effect: {
    kind: "return-from-graveyard",
    filter: {
      typesAnyOf: ["artifact", "battle", "creature", "enchantment", "planeswalker"],
      notTypes: ["land"],
    },
    destination: "battlefield",
    count: "all",
  },
});
