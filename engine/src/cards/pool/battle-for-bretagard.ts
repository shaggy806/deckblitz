import { defineCard } from "../define.js";

const CHAPTER_THREE =
  "III — Choose any number of artifact tokens and/or creature tokens you control with different names. For each of them, create a token that's a copy of it.";

export default defineCard({
  name: "Battle for Bretagard",
  manaCost: "{1}{G}{W}",
  colors: ["G", "W"],
  types: ["enchantment"],
  subtypes: ["Saga"],
  text:
    "(As this Saga enters and after your draw step, add a lore counter. Sacrifice after III.)\n" +
    "I — Create a 1/1 white Human Warrior creature token.\n" +
    "II — Create a 1/1 green Elf Warrior creature token.\n" +
    CHAPTER_THREE,
  chapters: [
    {
      at: [1],
      targets: [],
      effect: { kind: "create-token", token: "Human Warrior Token", count: 1 },
      resolve: null,
      text: "I — Create a 1/1 white Human Warrior creature token.",
    },
    {
      at: [2],
      targets: [],
      effect: { kind: "create-token", token: "Elf Warrior Token", count: 1 },
      resolve: null,
      text: "II — Create a 1/1 green Elf Warrior creature token.",
    },
    {
      at: [3],
      targets: [],
      effect: {
        kind: "choose-permanents",
        filter: { token: true, typesAnyOf: ["artifact", "creature"], controlledBy: "you" },
        upTo: 99,
        together: { distinctNames: true },
        then: { kind: "create-token-copy", of: 0, count: 1, who: "you" },
        prompt: "Choose any number of artifact and/or creature tokens with different names to copy",
      },
      resolve: null,
      text: CHAPTER_THREE,
    },
  ],
});
