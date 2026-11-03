import { defineCard } from "../define.js";

export default defineCard({
  name: "Court of Locthwain",
  manaCost: "{2}{B}{B}",
  colors: ["B"],
  types: ["enchantment"],
  text: "When this enchantment enters, you become the monarch.\nAt the beginning of your upkeep, exile the top card of target opponent's library. You may play that card for as long as it remains exiled, and mana of any type can be spent to cast it. If you're the monarch, until end of turn, you may cast a spell from among cards exiled with this enchantment without paying its mana cost.",
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      resolve: null,
      text: "When this enchantment enters, you become the monarch.",
      targets: [],
      effect: { kind: "become-monarch" },
    },
    {
      trigger: { on: "step-begins", step: "upkeep", who: "you" },
      resolve: null,
      text: "At the beginning of your upkeep, exile the top card of target opponent's library. You may play that card for as long as it remains exiled, and mana of any type can be spent to cast it. If you're the monarch, until end of turn, you may cast a spell from among cards exiled with this enchantment without paying its mana cost.",
      targets: ["opponent"],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "impulse-exile", amount: 1, whose: 0, duration: "while-exiled", spendAs: "any-type", linked: true },
          {
            kind: "conditional",
            condition: { kind: "monarch", who: "you" },
            then: { kind: "allow-cast-linked-exile", free: true },
          },
        ],
      },
    },
  ],
});
