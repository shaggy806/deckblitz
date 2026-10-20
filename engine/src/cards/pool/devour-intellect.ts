import { defineCard } from "../define.js";

// EDHREC rank 20967. "If mana from a Treasure was spent to cast this spell"
// reads the spell itself as it resolves (`manaFrom` on the source).

export default defineCard({
  name: "Devour Intellect",
  manaCost: "{B}",
  colors: ["B"],
  types: ["sorcery"],
  text: "Target opponent discards a card. If mana from a Treasure was spent to cast this spell, instead that player reveals their hand, you choose a nonland card from it, then that player discards that card.",
  targets: ["opponent"],
  effect: {
    kind: "conditional",
    condition: { kind: "source", filter: { manaFrom: { subtype: "Treasure" } } },
    then: { kind: "discard-chosen", target: 0, filter: { notTypes: ["land"] } },
    else: { kind: "discard", target: 0, amount: 1 },
  },
});
