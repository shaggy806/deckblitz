import { defineCard } from "../define.js";

const CHAPTER_I = "I — Destroy target nonland permanent.";
const CHAPTER_II = "II — Mill three cards.";
const RETURN_TEXT = "When you do, return target creature or land card from your graveyard to your hand.";
const CHAPTER_III = `III — You may discard a card. ${RETURN_TEXT}`;

export default defineCard({
  name: "Awaken the Honored Dead",
  manaCost: "{B}{G}{U}",
  colors: ["U", "B", "G"],
  types: ["enchantment"],
  subtypes: ["Saga"],
  text: `(As this Saga enters and after your draw step, add a lore counter. Sacrifice after III.)\n${CHAPTER_I}\n${CHAPTER_II}\n${CHAPTER_III}`,
  chapters: [
    {
      at: [1],
      targets: ["nonland-permanent"],
      effect: { kind: "destroy", target: 0 },
      resolve: null,
      text: CHAPTER_I,
    },
    {
      at: [2],
      targets: [],
      effect: { kind: "mill", target: "you", amount: 3 },
      resolve: null,
      text: CHAPTER_II,
    },
    {
      at: [3],
      targets: [],
      // The target is chosen by the reflexive ability as it goes on the
      // stack (the ruling): the card just discarded may be it.
      effect: {
        kind: "may",
        prompt: "Discard a card?",
        effect: {
          kind: "sequence",
          effects: [
            { kind: "discard", target: "you", amount: 1 },
            {
              kind: "conditional",
              condition: { kind: "this-way", what: "discarded" },
              then: {
                kind: "reflexive-trigger",
                targets: [
                  { kind: "card-in-graveyard", whose: "you", filter: { typesAnyOf: ["creature", "land"] } },
                ],
                effect: { kind: "return-to-hand", target: 0, from: "graveyard" },
                text: RETURN_TEXT,
              },
            },
          ],
        },
      },
      resolve: null,
      text: CHAPTER_III,
    },
  ],
});
