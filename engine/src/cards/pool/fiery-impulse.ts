import { defineCard } from "../define.js";

// Magic Origins (ORI). EDHREC rank 18456.
//
// Spell mastery is checked as it resolves; the spell itself is on the stack, so it doesn't count.

export default defineCard({
  name: "Fiery Impulse",
  manaCost: "{R}",
  colors: ["R"],
  types: ["instant"],
  text: "Fiery Impulse deals 2 damage to target creature.\nSpell mastery — If there are two or more instant and/or sorcery cards in your graveyard, Fiery Impulse deals 3 damage instead.",
  targets: ["creature"],
  effect: {
    kind: "conditional",
    condition: { kind: "cards-in-graveyard", atLeast: 2, filter: { typesAnyOf: ["instant", "sorcery"] } },
    then: { kind: "damage", amount: 3, target: 0 },
    else: { kind: "damage", amount: 2, target: 0 },
  },
});
