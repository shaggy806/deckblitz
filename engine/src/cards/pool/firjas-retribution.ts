import { defineCard } from "../define.js";

// EDHREC rank 8541. Kaldheim.
//
// II — the granted ability's "this creature's power" is the Angel that has
// it, bound as it's activated (and checked again on resolution, rule
// 608.2b), not the Saga that granted it. Only Angels you control as the
// chapter resolves gain it (rule 611.2c — the ruling).
const CHAPTER_I = "I — Create a 4/4 white Angel Warrior creature token with flying and vigilance.";
const CHAPTER_II =
  'II — Until end of turn, Angels you control gain "{T}: Destroy target creature with power less than this creature\'s power."';
const CHAPTER_III = "III — Angels you control gain double strike until end of turn.";
const GRANTED_TEXT = "{T}: Destroy target creature with power less than this creature's power.";

const ANGELS = { type: "creature", subtype: "Angel", controlledBy: "you" } as const;

export default defineCard({
  name: "Firja's Retribution",
  manaCost: "{1}{W}{W}{B}",
  colors: ["W", "B"],
  types: ["enchantment"],
  subtypes: ["Saga"],
  text:
    "(As this Saga enters and after your draw step, add a lore counter. Sacrifice after III.)\n" +
    `${CHAPTER_I}\n${CHAPTER_II}\n${CHAPTER_III}`,
  chapters: [
    {
      at: [1],
      targets: [],
      effect: { kind: "create-token", token: "Angel Warrior Token (Flying, Vigilance)", count: 1 },
      resolve: null,
      text: CHAPTER_I,
    },
    {
      at: [2],
      targets: [],
      effect: {
        kind: "grant-activated-all",
        filter: ANGELS,
        ability: {
          cost: { mana: null, tap: true },
          targets: [
            { kind: "permanent", filter: { type: "creature", power: { op: "lt", n: { amount: { powerOf: "source" } } } } },
          ],
          effect: { kind: "destroy", target: 0 },
          resolve: null,
          text: GRANTED_TEXT,
        },
        duration: "end-of-turn",
      },
      resolve: null,
      text: CHAPTER_II,
    },
    {
      at: [3],
      targets: [],
      effect: { kind: "grant-keyword-all", filter: ANGELS, keyword: "double-strike", duration: "end-of-turn" },
      resolve: null,
      text: CHAPTER_III,
    },
  ],
});
