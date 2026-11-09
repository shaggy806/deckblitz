import { defineCard } from "../define.js";

export default defineCard({
  name: "Chthonian Nightmare",
  manaCost: "{1}{B}",
  colors: ["B"],
  types: ["enchantment"],
  text: "When this enchantment enters, you get {E}{E}{E} (three energy counters).\nPay X {E}, Sacrifice a creature, Return this enchantment to its owner's hand: Return target creature card with mana value X from your graveyard to the battlefield. Activate only as a sorcery.",
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: { kind: "get-energy", amount: 3 },
      resolve: null,
      text: "When this enchantment enters, you get {E}{E}{E} (three energy counters).",
    },
  ],
  activated: [
    {
      cost: {
        mana: null,
        tap: false,
        sacrifice: "creature-you-control",
        do: {
          kind: "sequence",
          effects: [
            { kind: "pay-energy", amount: "x" },
            { kind: "return-to-hand", target: "source" },
          ],
        },
      },
      sorcerySpeed: true,
      targets: [{ kind: "card-in-graveyard", whose: "you", filter: { type: "creature", manaValue: { op: "eq", n: "x" } } }],
      effect: { kind: "put-onto-battlefield", target: 0 },
      resolve: null,
      text: "Pay X {E}, Sacrifice a creature, Return this enchantment to its owner's hand: Return target creature card with mana value X from your graveyard to the battlefield. Activate only as a sorcery.",
    },
  ],
});
