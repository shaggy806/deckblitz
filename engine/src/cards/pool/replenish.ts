import { defineCard } from "../define.js";

// EDHREC rank 3860. Also Eiganjo Dynastorian's prepare spell (rule 722).
//
// Rulings:
//   [2005-08-01] Auras can only be placed on permanents that were on the battlefield before this
//     effect started to resolve. You can't put an enchantment onto the battlefield with Replenish
//     and put an Aura that is also entering onto one of those enchantments.
//   [2005-08-01] You must return Auras if possible, even if this means enchanting an opponent's
//     permanent with a good enchantment.
//
// Brilliant Restoration's shape: every Aura's "enchant" choice is made before
// anything moves (rule 614.12), among permanents already there, an opponent's
// included; one with nothing to enchant stays in the graveyard (303.4g).
export default defineCard({
  name: "Replenish",
  // Pinned: Scryfall answers "Replenish" by name with Eiganjo Dynastorian // Replenish, whose
  // prepare spell or adventure shares the name.
  art: "7fd2fe13-bbc0-42b7-bc42-3b51910ce118",
  manaCost: "{3}{W}",
  colors: ["W"],
  types: ["sorcery"],
  text: "Return all enchantment cards from your graveyard to the battlefield. (Auras with nothing to enchant remain in your graveyard.)",
  effect: {
    kind: "return-from-graveyard",
    filter: { type: "enchantment" },
    destination: "battlefield",
    count: "all",
  },
});
