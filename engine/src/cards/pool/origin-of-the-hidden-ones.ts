import { defineCard } from "../define.js";

// EDHREC rank 12383.
// Makes Assassin → use "Assassin Token (Aya of Alexandria)".
// III is a delayed triggered ability for the rest of the turn (rule
// 603.7c): any Assassin you control that attacks fires it, one that became
// yours (or an Assassin) after III resolved included. Each token enters
// attacking a player, planeswalker or battle of your choice and was never
// declared as an attacker, so it fires nothing that watches attacks (the
// rulings) — not this ability either.
const CHAPTER_I = "I — This Saga deals 4 damage to any target.";
const CHAPTER_II = "II — Create two 1/1 black Assassin creature tokens with menace.";
const CHAPTER_III_BODY =
  "Whenever an Assassin you control attacks this turn, create a 1/1 black Assassin creature token with menace that's tapped and attacking.";
const CHAPTER_III = `III — ${CHAPTER_III_BODY}`;

export default defineCard({
  name: "Origin of the Hidden Ones",
  manaCost: "{3}{R}",
  colors: ["R"],
  types: ["enchantment"],
  subtypes: ["Saga"],
  text:
    "(As this Saga enters and after your draw step, add a lore counter. Sacrifice after III.)\n" +
    `${CHAPTER_I}\n${CHAPTER_II}\n${CHAPTER_III}`,
  chapters: [
    {
      at: [1],
      targets: ["any-target"],
      effect: { kind: "damage", amount: 4, target: 0 },
      resolve: null,
      text: CHAPTER_I,
    },
    {
      at: [2],
      targets: [],
      effect: { kind: "create-token", token: "Assassin Token (Aya of Alexandria)", count: 2 },
      resolve: null,
      text: CHAPTER_II,
    },
    {
      at: [3],
      targets: [],
      effect: {
        kind: "delayed-trigger",
        at: { whenever: { on: "attacks", who: "you-control", filter: { subtype: "Assassin" } } },
        effect: {
          kind: "create-token",
          token: "Assassin Token (Aya of Alexandria)",
          count: 1,
          tapped: true,
          attacking: "choose",
        },
        text: CHAPTER_III_BODY,
      },
      resolve: null,
      text: CHAPTER_III,
    },
  ],
});
