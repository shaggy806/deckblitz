import { defineCard } from "../define.js";

// The division is announced as it's cast whatever is paid (the rulings), so
// `divided` always applies; with seven red spent, each target takes 7 instead,
// one damage event. A target gone illegal is dealt nothing either way.
export default defineCard({
  name: "Sundering Stroke",
  manaCost: "{6}{R}",
  colors: ["R"],
  types: ["sorcery"],
  text: "Sundering Stroke deals 7 damage divided as you choose among one, two, or three targets. If at least seven red mana was spent to cast this spell, instead Sundering Stroke deals 7 damage to each of those permanents and/or players.",
  targets: [{ kind: "any-number", of: "any-target", min: 1, max: 3 }],
  divided: { total: 7, slot: 0 },
  effect: {
    kind: "conditional",
    condition: { kind: "source", filter: { manaSpentOfColors: { R: 7 } } },
    then: { kind: "for-each-target", from: 0, effect: { kind: "damage", amount: 7, target: 0 }, simultaneous: true },
    else: { kind: "damage-divided", from: 0 },
  },
});
