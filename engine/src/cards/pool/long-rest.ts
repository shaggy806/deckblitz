import { defineCard } from "../define.js";

// Exactly X targets, no two with the same mana value (an {X} in a card's cost counts 0 there,
// rule 202.3e), returned as one event; "this way" counts the ones that got to the hand. With every
// target illegal the spell doesn't resolve, so it goes to the graveyard rather than exile.

const TEXT =
  "Return X target cards with different mana values from your graveyard to your hand. If eight or more cards were returned to your hand this way, your life total becomes equal to your starting life total. Exile Long Rest.";

export default defineCard({
  name: "Long Rest",
  manaCost: "{X}{G}{G}{G}",
  colors: ["G"],
  types: ["sorcery"],
  text: TEXT,
  targets: [
    {
      kind: "any-number",
      of: { kind: "card-in-graveyard", whose: "you" },
      min: "x",
      max: "x",
      differentManaValues: true,
    },
  ],
  effect: {
    kind: "sequence",
    effects: [
      {
        kind: "for-each-target",
        from: 0,
        simultaneous: true,
        effect: { kind: "return-to-hand", target: 0, from: "graveyard" },
      },
      {
        kind: "conditional",
        condition: { kind: "this-way", what: "returned-to-hand", atLeast: 8 },
        then: { kind: "set-life-total", who: "you", amount: { startingLifeTotal: true } },
      },
    ],
  },
  exileOnResolve: true,
});
