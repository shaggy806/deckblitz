import { defineCard } from "../define.js";

const TEXT = "If you would draw a card while you have no cards in hand, instead you draw two cards and you lose 1 life.";

export default defineCard({
  name: "Blood Scrivener",
  manaCost: "{1}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Zombie", "Wizard"],
  power: 2,
  toughness: 1,
  text: TEXT,
  static: [
    {
      affects: { scope: "self" },
      replacement: {
        event: "would-draw",
        who: "you",
        whileHandAtMost: 0,
        instead: { modify: { set: 2 }, also: { kind: "lose-life", amount: 1 } },
      },
      text: TEXT,
    },
  ],
});
