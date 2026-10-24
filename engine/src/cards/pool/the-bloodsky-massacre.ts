import { defineCard } from "../define.js";

// EDHREC rank 23930.
// Makes Demon Berserker → use "Demon Berserker Token".
// II is a delayed triggered ability for the rest of the turn (rule 603.7c):
// any Berserker that attacks, whoever controls it. III isn't a mana ability
// — it counts the Berserkers you control as it resolves (the ruling).
const CHAPTER_I = "I — Create a 2/3 red Demon Berserker creature token with menace.";
const CHAPTER_II_BODY = "Whenever a Berserker attacks this turn, you draw a card and you lose 1 life.";
const CHAPTER_II = `II — ${CHAPTER_II_BODY}`;
const CHAPTER_III =
  "III — Add {R} for each Berserker you control. Until end of turn, you don't lose this mana as steps and phases end.";

export default defineCard({
  name: "The Bloodsky Massacre",
  manaCost: "{1}{B}{R}",
  colors: ["B", "R"],
  types: ["enchantment"],
  subtypes: ["Saga"],
  text:
    "(As this Saga enters and after your draw step, add a lore counter. Sacrifice after III.)\n" +
    `${CHAPTER_I}\n${CHAPTER_II}\n${CHAPTER_III}`,
  chapters: [
    {
      at: [1],
      targets: [],
      effect: { kind: "create-token", token: "Demon Berserker Token", count: 1 },
      resolve: null,
      text: CHAPTER_I,
    },
    {
      at: [2],
      targets: [],
      effect: {
        kind: "delayed-trigger",
        at: { whenever: { on: "attacks", who: "any", filter: { subtype: "Berserker" } } },
        effect: {
          kind: "sequence",
          effects: [
            { kind: "draw", amount: 1 },
            { kind: "lose-life", amount: 1 },
          ],
        },
        text: CHAPTER_II_BODY,
      },
      resolve: null,
      text: CHAPTER_II,
    },
    {
      at: [3],
      targets: [],
      effect: {
        kind: "add-mana",
        mana: "R",
        amount: { countOf: { subtype: "Berserker", controlledBy: "you" } },
        persists: true,
      },
      resolve: null,
      text: CHAPTER_III,
    },
  ],
});
