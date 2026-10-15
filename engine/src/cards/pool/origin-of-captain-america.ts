import { defineCard } from "../define.js";

// EDHREC rank 25265.
// Makes Sturdy Shield → "Sturdy Shield Token".

const CHAPTER_I =
  "I — Put a +1/+1 counter on target creature you control. It gains first strike and vigilance until end of turn.";
const CHAPTER_II =
  'II — Create a colorless Equipment artifact token named Sturdy Shield with "Equipped creature gets +1/+2" and equip {2}.';
const CHAPTER_III = "III — Tap up to one target creature and put a stun counter on it.";

export default defineCard({
  name: "Origin of Captain America",
  manaCost: "{2}{W}",
  colors: ["W"],
  types: ["enchantment"],
  subtypes: ["Saga"],
  text:
    "(As this Saga enters and after your draw step, add a lore counter. Sacrifice after III.)\n" +
    `${CHAPTER_I}\n${CHAPTER_II}\n${CHAPTER_III}`,
  chapters: [
    {
      at: [1],
      targets: ["creature-you-control"],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "add-counter", target: 0, counter: "+1/+1", amount: 1 },
          { kind: "grant-keyword", target: 0, keyword: "first-strike", duration: "end-of-turn" },
          { kind: "grant-keyword", target: 0, keyword: "vigilance", duration: "end-of-turn" },
        ],
      },
      resolve: null,
      text: CHAPTER_I,
    },
    {
      at: [2],
      targets: [],
      effect: { kind: "create-token", token: "Sturdy Shield Token", count: 1 },
      resolve: null,
      text: CHAPTER_II,
    },
    {
      at: [3],
      targets: [{ kind: "optional", of: "creature" }],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "tap", target: 0 },
          { kind: "add-counter", target: 0, counter: "stun", amount: 1 },
        ],
      },
      resolve: null,
      text: CHAPTER_III,
    },
  ],
});
