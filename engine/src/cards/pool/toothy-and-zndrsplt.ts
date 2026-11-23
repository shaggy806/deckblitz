import { defineCard } from "../define.js";

// Playtest card: Zndrsplt's flips feeding Toothy's counters. The last
// ability counts the counters it had as it left (rule 603.10a).

export default defineCard({
  name: "Toothy and Zndrsplt",
  manaCost: "{3}{U}",
  colors: ["U"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Homunculus", "Illusion"],
  power: 2,
  toughness: 2,
  text: "Whenever you win a coin flip, put a +1/+1 counter on Toothy and Zndrsplt.\nAt the beginning of combat on your turn, flip a coin until you lose a flip.\nWhen Toothy and Zndrsplt leaves the battlefield, draw a card for each +1/+1 counter on Toothy and Zndrsplt.",
  triggered: [
    {
      trigger: { on: "event", event: "wins-coin-flip", who: "you" },
      targets: [],
      effect: { kind: "add-counter", target: "source", counter: "+1/+1", amount: 1 },
      resolve: null,
      text: "Whenever you win a coin flip, put a +1/+1 counter on Toothy and Zndrsplt.",
    },
    {
      trigger: { on: "step-begins", step: "begin-combat", who: "you" },
      targets: [],
      effect: {
        kind: "repeat",
        effect: { kind: "flip-coin" },
        again: { kind: "this-way", what: "flips-won" },
      },
      resolve: null,
      text: "At the beginning of combat on your turn, flip a coin until you lose a flip.",
    },
    {
      trigger: { on: "leaves-battlefield", who: "self" },
      targets: [],
      effect: { kind: "draw", amount: { countersOn: "source", counter: "+1/+1" } },
      resolve: null,
      text: "When Toothy and Zndrsplt leaves the battlefield, draw a card for each +1/+1 counter on Toothy and Zndrsplt.",
    },
  ],
});
