import { defineCard } from "../define.js";

// EDHREC rank 9098.
// II is a delayed triggered ability for the rest of the turn (rule 603.7c):
// any Assassin you control that attacks this turn gets the counter, one that
// arrived after II resolved included.
const CHAPTER_I = "I — Destroy target tapped creature an opponent controls.";
const CHAPTER_II_BODY = "Whenever an Assassin you control attacks this turn, put a +1/+1 counter on it.";
const CHAPTER_II = `II — ${CHAPTER_II_BODY}`;
const CHAPTER_III =
  "III — Return target Assassin creature card from your graveyard to the battlefield with an additional +1/+1 counter on it.";

export default defineCard({
  name: "The Revelations of Ezio",
  manaCost: "{2}{B}",
  colors: ["B"],
  types: ["enchantment"],
  subtypes: ["Saga"],
  text:
    "(As this Saga enters and after your draw step, add a lore counter. Sacrifice after III.)\n" +
    `${CHAPTER_I}\n${CHAPTER_II}\n${CHAPTER_III}`,
  chapters: [
    {
      at: [1],
      targets: [{ kind: "permanent", whose: "opponent", filter: { type: "creature", tapped: true } }],
      effect: { kind: "destroy", target: 0 },
      resolve: null,
      text: CHAPTER_I,
    },
    {
      at: [2],
      targets: [],
      effect: {
        kind: "delayed-trigger",
        at: { whenever: { on: "attacks", who: "you-control", filter: { subtype: "Assassin" } } },
        effect: { kind: "add-counter", target: "trigger-object", counter: "+1/+1", amount: 1 },
        text: CHAPTER_II_BODY,
      },
      resolve: null,
      text: CHAPTER_II,
    },
    {
      at: [3],
      targets: [{ kind: "card-in-graveyard", whose: "you", filter: { type: "creature", subtype: "Assassin" } }],
      effect: { kind: "put-onto-battlefield", target: 0, withCounters: { kind: "+1/+1", amount: 1 } },
      resolve: null,
      text: CHAPTER_III,
    },
  ],
});
