import { defineCard } from "../define.js";

// Rulings:
//   [2017-07-14] Most nonbasic lands that produce green mana aren't Forests. Some nonbasic lands
//     do have basic land types printed on the type line and may be Forests.
// "If that permanent was a Nissa planeswalker" reads the target as it last
// existed once it's destroyed (rule 608.2h).

export default defineCard({
  name: "Nissa's Defeat",
  manaCost: "{2}{G}",
  colors: ["G"],
  types: ["sorcery"],
  text: "Destroy target Forest, green enchantment, or green planeswalker. If that permanent was a Nissa planeswalker, draw a card.",
  targets: [
    {
      kind: "permanent",
      whose: "any",
      filter: {
        anyOf: [{ subtype: "Forest" }, { type: "enchantment", colors: ["G"] }, { type: "planeswalker", colors: ["G"] }],
      },
    },
  ],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "destroy", target: 0 },
      {
        kind: "conditional",
        condition: { kind: "target", index: 0, filter: { type: "planeswalker", subtype: "Nissa" } },
        then: { kind: "draw", amount: 1 },
      },
    ],
  },
});
