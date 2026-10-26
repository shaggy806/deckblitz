import { defineCard } from "../define.js";

// Shadowmoor (SHM). EDHREC rank 30412.
//
// Both targets are chosen as it's cast, before the mana is paid; each half
// checks on resolution whether that colour was spent on the whole cost (the
// rulings), and a copy has had no mana spent on it.
export default defineCard({
  name: "River's Grasp",
  manaCost: "{3}{U/B}",
  colors: ["U", "B"],
  types: ["sorcery"],
  text: "If {U} was spent to cast this spell, return up to one target creature to its owner's hand. If {B} was spent to cast this spell, target player reveals their hand, you choose a nonland card from it, then that player discards that card. (Do both if {U}{B} was spent.)",
  targets: [{ kind: "optional", of: "creature" }, "player"],
  effect: {
    kind: "sequence",
    effects: [
      {
        kind: "conditional",
        condition: { kind: "source", filter: { manaSpentOfColors: { U: 1 } } },
        then: { kind: "return-to-hand", target: 0 },
      },
      {
        kind: "conditional",
        condition: { kind: "source", filter: { manaSpentOfColors: { B: 1 } } },
        then: { kind: "discard-chosen", target: 1, filter: { notTypes: ["land"] } },
      },
    ],
  },
});
