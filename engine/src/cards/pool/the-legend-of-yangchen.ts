import { defineCard } from "../define.js";

// EDHREC rank 4301.
//
// I: not targeted — starting with you, each player in turn order chooses up
// to one permanent your opponents control with mana value 3 or greater
// (`vote` with `choose`, read from your side), knowing the choices before;
// once all have chosen, every chosen permanent is exiled at once (the ruling).
// II: the opponent is targeted as the chapter triggers; whether they draw is
// chosen as it resolves (the ruling). III: Azusa's Many Journeys' return.
const CHAPTER_I =
  "I — Starting with you, each player chooses up to one permanent with mana value 3 or greater from among permanents your opponents control. Exile those permanents.";
const CHAPTER_II = "II — You may have target opponent draw three cards. If you do, draw three cards.";
const CHAPTER_III = "III — Exile this Saga, then return it to the battlefield transformed under your control.";

export default defineCard({
  name: "The Legend of Yangchen",
  manaCost: "{3}{W}{W}",
  colors: ["W"],
  types: ["enchantment"],
  subtypes: ["Saga"],
  text: `(As this Saga enters and after your draw step, add a lore counter.)\n${CHAPTER_I}\n${CHAPTER_II}\n${CHAPTER_III}`,
  faces: ["The Legend of Yangchen", "Avatar Yangchen"],
  transform: true,
  chapters: [
    {
      at: [1],
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          {
            kind: "vote",
            choose: true,
            startingWith: "you",
            for: { permanent: { manaValue: { op: "gte", n: 3 }, controlledBy: "opponent" }, upToOne: true },
          },
          { kind: "for-each-voted", which: "voted", simultaneous: true, effect: { kind: "exile", target: 0 } },
        ],
      },
      resolve: null,
      text: CHAPTER_I,
    },
    {
      at: [2],
      targets: ["opponent"],
      effect: {
        kind: "may",
        prompt: "Have the opponent draw three cards, then draw three cards?",
        effect: {
          kind: "sequence",
          effects: [
            { kind: "draw", amount: 3, target: 0 },
            { kind: "draw", amount: 3 },
          ],
        },
      },
      resolve: null,
      text: CHAPTER_II,
    },
    {
      at: [3],
      targets: [],
      effect: { kind: "flicker", target: "source", transformed: true, underYourControl: true },
      resolve: null,
      text: CHAPTER_III,
    },
  ],
});
