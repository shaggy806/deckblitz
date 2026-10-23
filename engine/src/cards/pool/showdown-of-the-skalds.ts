import { defineCard } from "../define.js";

// EDHREC rank 8018.
// II and III each set up a delayed triggered ability for the rest of that
// turn (rule 603.7c) with a target of its own, chosen each time it
// triggers. I's cards are exiled face up and stay exiled if not played (the
// rulings).
const CHAPTER_I =
  "I — Exile the top four cards of your library. Until the end of your next turn, you may play those cards.";
const CHAPTER_II_III_BODY = "Whenever you cast a spell this turn, put a +1/+1 counter on target creature you control.";
const CHAPTER_II_III = `II, III — ${CHAPTER_II_III_BODY}`;

export default defineCard({
  name: "Showdown of the Skalds",
  manaCost: "{2}{R}{W}",
  colors: ["W", "R"],
  types: ["enchantment"],
  subtypes: ["Saga"],
  text:
    "(As this Saga enters and after your draw step, add a lore counter. Sacrifice after III.)\n" +
    `${CHAPTER_I}\n${CHAPTER_II_III}`,
  chapters: [
    {
      at: [1],
      targets: [],
      effect: { kind: "impulse-exile", amount: 4, duration: "your-next-turn" },
      resolve: null,
      text: CHAPTER_I,
    },
    {
      at: [2, 3],
      targets: [],
      effect: {
        kind: "delayed-trigger",
        at: { whenever: { on: "cast-spell", who: "you" }, targets: ["creature-you-control"] },
        effect: { kind: "add-counter", target: 0, counter: "+1/+1", amount: 1 },
        text: CHAPTER_II_III_BODY,
      },
      resolve: null,
      text: CHAPTER_II_III,
    },
  ],
});
