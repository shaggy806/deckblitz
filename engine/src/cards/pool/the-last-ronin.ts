import { defineCard } from "../define.js";

// EDHREC rank 17259.
// II's return is a reflexive trigger whose target is chosen only once the
// four cards are milled (the ruling). III is a delayed triggered ability for
// the rest of the turn (rule 603.7c): a creature you control attacking alone
// in any combat this turn gets it, one that arrived after III included.
const CHAPTER_I = "I — Destroy all creatures.";
const CHAPTER_II = "II — Mill four cards. When you do, return target creature card from your graveyard to your hand.";
const CHAPTER_III_BODY =
  "Whenever a creature you control attacks alone this turn, put three +1/+1 counters on it. It gains trample, lifelink, and indestructible until end of turn.";
const CHAPTER_III = `III — ${CHAPTER_III_BODY}`;

export default defineCard({
  name: "The Last Ronin",
  manaCost: "{4}{B}{G}",
  colors: ["B", "G"],
  types: ["enchantment"],
  subtypes: ["Saga"],
  text:
    "(As this Saga enters and after your draw step, add a lore counter. Sacrifice after III.)\n" +
    `${CHAPTER_I}\n${CHAPTER_II}\n${CHAPTER_III}`,
  chapters: [
    {
      at: [1],
      targets: [],
      effect: { kind: "destroy-all", filter: { type: "creature" } },
      resolve: null,
      text: CHAPTER_I,
    },
    {
      at: [2],
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "mill", target: "you", amount: 4 },
          {
            kind: "conditional",
            condition: { kind: "this-way", what: "milled", atLeast: 4 },
            then: {
              kind: "reflexive-trigger",
              targets: [{ kind: "card-in-graveyard", whose: "you", filter: { type: "creature" } }],
              effect: { kind: "return-to-hand", target: 0, from: "graveyard" },
              text: "When you do, return target creature card from your graveyard to your hand.",
            },
          },
        ],
      },
      resolve: null,
      text: CHAPTER_II,
    },
    {
      at: [3],
      targets: [],
      effect: {
        kind: "delayed-trigger",
        at: { whenever: { on: "attacks-alone", who: "you-control" } },
        effect: {
          kind: "sequence",
          effects: [
            { kind: "add-counter", target: "trigger-object", counter: "+1/+1", amount: 3 },
            { kind: "grant-keyword", target: "trigger-object", keyword: "trample", duration: "end-of-turn" },
            { kind: "grant-keyword", target: "trigger-object", keyword: "lifelink", duration: "end-of-turn" },
            { kind: "grant-keyword", target: "trigger-object", keyword: "indestructible", duration: "end-of-turn" },
          ],
        },
        text: CHAPTER_III_BODY,
      },
      resolve: null,
      text: CHAPTER_III,
    },
  ],
});
