import { defineCard } from "../define.js";

export default defineCard({
  name: "Malakir Soothsayer",
  manaCost: "{4}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Vampire", "Shaman", "Ally"],
  power: 4,
  toughness: 4,
  text: "Cohort — {T}, Tap an untapped Ally you control: You draw a card and you lose 1 life.",
  activated: [
    {
      cost: {
        mana: null,
        tap: true,
        tapOthers: { count: 1, filter: { subtype: "Ally", controlledBy: "you" } },
      },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [{ kind: "draw", amount: 1 }, { kind: "lose-life", amount: 1 }],
      },
      resolve: null,
      text: "Cohort — {T}, Tap an untapped Ally you control: You draw a card and you lose 1 life.",
    },
  ],
});
