import { defineCard } from "../define.js";

// EDHREC rank 8751.

export default defineCard({
  name: "Fall of Gil-galad",
  manaCost: "{1}{G}",
  colors: ["G"],
  types: ["enchantment"],
  subtypes: ["Saga"],
  text: "(As this Saga enters and after your draw step, add a lore counter. Sacrifice after III.)\nI — Scry 2.\nII — Put two +1/+1 counters on target creature you control.\nIII — Until end of turn, target creature you control gains \"When this creature dies, draw two cards.\" Then that creature fights up to one other target creature.",
  chapters: [
    {
      at: [1],
      targets: [],
      effect: { kind: "scry", amount: 2 },
      resolve: null,
      text: "I — Scry 2.",
    },
    {
      at: [2],
      targets: ["creature-you-control"],
      effect: { kind: "add-counter", target: 0, counter: "+1/+1", amount: 2 },
      resolve: null,
      text: "II — Put two +1/+1 counters on target creature you control.",
    },
    {
      at: [3],
      // The grant comes first, so a creature that dies in the fight draws
      // its controller two cards; with no second target, nothing fights.
      targets: ["creature-you-control", { kind: "optional", of: { kind: "other", of: "creature", than: { slot: 0 } } }],
      effect: {
        kind: "sequence",
        effects: [
          {
            kind: "grant-triggered",
            target: 0,
            duration: "end-of-turn",
            ability: {
              trigger: { on: "dies", who: "self" },
              targets: [],
              effect: { kind: "draw", amount: 2 },
              resolve: null,
              text: "When this creature dies, draw two cards.",
            },
          },
          { kind: "fight", a: 0, b: 1 },
        ],
      },
      resolve: null,
      text: 'III — Until end of turn, target creature you control gains "When this creature dies, draw two cards." Then that creature fights up to one other target creature.',
    },
  ],
});
