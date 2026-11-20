import { defineCard } from "../define.js";

// EDHREC rank 17918.
//
// Chapter II keeps the name on the Saga (`remember`), which chapter III's
// "the chosen name" reads (`chosenName`). Chapter III's delayed trigger lasts
// the turn and fires once, on the first spell with that name you cast this
// turn: the timing wrapper counts every spell with it cast this turn, so one
// cast before chapter III resolved (in response to it) means none later is
// the first (its triage). With no name chosen it can't trigger (the ruling).

const SAGA_TEXT = "(As this Saga enters and after your draw step, add a lore counter. Sacrifice after IV.)";
const ONE = "I — Scry 2.";
const TWO = "II — Choose a card name.";
const THREE = "III — When you cast a spell with the chosen name for the first time this turn, draw two cards.";
const FOUR = "IV — Look at the top card of each player's library.";

export default defineCard({
  name: "Medomai's Prophecy",
  manaCost: "{1}{U}",
  colors: ["U"],
  types: ["enchantment"],
  subtypes: ["Saga"],
  text: `${SAGA_TEXT}\n${ONE}\n${TWO}\n${THREE}\n${FOUR}`,
  chapters: [
    {
      at: [1],
      targets: [],
      effect: { kind: "scry", amount: 2 },
      resolve: null,
      text: ONE,
    },
    {
      at: [2],
      targets: [],
      effect: { kind: "choose-card-name", aim: "own-hand", remember: true },
      resolve: null,
      text: TWO,
    },
    {
      at: [3],
      targets: [],
      effect: {
        kind: "delayed-trigger",
        at: {
          whenever: { on: "cast-spell", who: "you", filter: { chosenName: true }, firstTimeEachTurn: true },
          once: true,
        },
        effect: { kind: "draw", amount: 2 },
        text: "When you cast a spell with the chosen name for the first time this turn, draw two cards.",
      },
      resolve: null,
      text: THREE,
    },
    {
      at: [4],
      targets: [],
      effect: {
        kind: "for-each-player",
        who: "each-player",
        effect: {
          kind: "look-and-choose",
          from: "that-player",
          zone: "library",
          count: 1,
          min: 0,
          max: 0,
          destination: "library-top",
          leftover: "stay",
        },
      },
      resolve: null,
      text: FOUR,
    },
  ],
});
