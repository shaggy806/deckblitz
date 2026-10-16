import { defineCard } from "../define.js";

// EDHREC rank 5004.
//
// Ram Through's one-sided damage from the first target (none if it's no
// longer legal), Hulk's Thunderclap's "another target creature", then
// Bolg of the North's excess: "if excess damage was dealt this way" and X
// that excess (rule 120.4a — lethal counts damage already marked).
export default defineCard({
  name: "Contest of Claws",
  manaCost: "{1}{G}",
  colors: ["G"],
  types: ["sorcery"],
  text: "Target creature you control deals damage equal to its power to another target creature. If excess damage was dealt this way, discover X, where X is that excess damage. (Exile cards from the top of your library until you exile a nonland card with that mana value or less. Cast it without paying its mana cost or put it into your hand. Put the rest on the bottom in a random order.)",
  targets: ["creature-you-control", { kind: "other", of: "creature", than: { slot: 0 } }],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "damage", amount: { powerOf: 0 }, target: 1, from: { target: 0 } },
      {
        kind: "conditional",
        condition: { kind: "excess-damage-this-way" },
        then: { kind: "discover", amount: { excessDamageThisWay: true } },
      },
    ],
  },
});
