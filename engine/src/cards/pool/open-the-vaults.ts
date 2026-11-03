import { defineCard } from "../define.js";

// Every graveyard at once, each card under its owner's control: one departure
// and one entry. An Aura's owner chooses what it enchants among what's already
// on the battlefield (rule 303.4f); with nothing there it stays (303.4g).

export default defineCard({
  name: "Open the Vaults",
  manaCost: "{4}{W}{W}",
  colors: ["W"],
  types: ["sorcery"],
  text: "Return all artifact and enchantment cards from all graveyards to the battlefield under their owners' control. (Auras with nothing to enchant remain in graveyards.)",
  effect: {
    kind: "return-from-graveyard",
    from: "each-graveyard",
    filter: { typesAnyOf: ["artifact", "enchantment"] },
    destination: "battlefield",
    count: "all",
  },
});
