import { defineCard } from "../define.js";

// Each enters trigger reads the colours spent on the whole cost — the evoke
// cost included (the rulings) — kept by the permanent from the spell.
const EXILE =
  "When this creature enters, if {G}{G} was spent to cast it, exile target artifact or enchantment an opponent controls.";
const LOOT = "When this creature enters, if {U}{U} was spent to cast it, draw two cards, then discard a card.";

export default defineCard({
  name: "Wistfulness",
  manaCost: "{3}{G/U}{G/U}",
  colors: ["U", "G"],
  types: ["creature"],
  subtypes: ["Elemental", "Incarnation"],
  power: 6,
  toughness: 5,
  evoke: { cost: "{G/U}{G/U}" },
  text: `${EXILE}\n${LOOT}\nEvoke {G/U}{G/U} (You may cast this spell for its evoke cost. If you do, it's sacrificed when it enters.)`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      condition: { kind: "source", filter: { manaSpentOfColors: { G: 2 } } },
      targets: [{ kind: "permanent", whose: "opponent", filter: { typesAnyOf: ["artifact", "enchantment"] } }],
      effect: { kind: "exile", target: 0 },
      resolve: null,
      text: EXILE,
    },
    {
      trigger: { on: "enters-battlefield", who: "self" },
      condition: { kind: "source", filter: { manaSpentOfColors: { U: 2 } } },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "draw", amount: 2 },
          { kind: "discard", target: "you", amount: 1 },
        ],
      },
      resolve: null,
      text: LOOT,
    },
  ],
});
