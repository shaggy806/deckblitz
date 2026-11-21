import { defineCard } from "../define.js";

// EDHREC rank 18982. Innistrad: Midnight Hunt.
//
// The flashback's mana has no {X}: X is announced for that cast (rules
// 107.3a, 601.2b), at least 1 ("X can't be 0") and no more than the loyalty
// counters on planeswalkers its caster controls, and that many are removed
// from among them as the cost is paid (601.2h, the `remove-counters`
// decision). The extra damage is read against the target as it resolves: a
// player target takes X.

export default defineCard({
  name: "Light Up the Night",
  manaCost: "{X}{R}",
  colors: ["R"],
  types: ["sorcery"],
  text: "Light Up the Night deals X damage to any target. It deals X plus 1 damage instead if that target is a creature or planeswalker.\nFlashback—{3}{R}, Remove X loyalty counters from among planeswalkers you control. If you cast this spell this way, X can't be 0. (You may cast this card from your graveyard for its flashback cost. Then exile it.)",
  targets: ["any-target"],
  effect: {
    kind: "damage",
    target: 0,
    amount: {
      ifCondition: { kind: "target", index: 0, filter: { typesAnyOf: ["creature", "planeswalker"] } },
      then: { sum: ["x", 1] },
      else: "x",
    },
  },
  flashback: {
    cost: "{3}{R}",
    also: {
      text: "Remove X loyalty counters from among planeswalkers you control",
      do: { kind: "remove-counters", from: { type: "planeswalker" }, counter: "loyalty", count: "x", among: true },
    },
    minX: 1,
  },
});
