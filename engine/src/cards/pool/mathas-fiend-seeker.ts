import { defineCard } from "../define.js";

// EDHREC rank 10363. Commander 2017.
//
// The bounty counter and the granted dies trigger come from the same
// resolution; the grant lasts while the creature has a bounty counter (rule
// 611.2b — `whileCounter`), even after Mathas leaves. Each resolution grants
// its own instance (the rulings), and the granted ability is controlled by
// the creature's controller as it dies, so "each opponent" is theirs.

const BOUNTY_TEXT = "When this creature dies, each opponent draws a card and gains 2 life.";

export default defineCard({
  name: "Mathas, Fiend Seeker",
  manaCost: "{R}{W}{B}",
  colors: ["R", "W", "B"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Vampire"],
  power: 3,
  toughness: 3,
  keywords: ["menace"],
  text: `Menace\nAt the beginning of your end step, put a bounty counter on target creature an opponent controls. For as long as that creature has a bounty counter on it, it has "${BOUNTY_TEXT}"`,
  triggered: [
    {
      trigger: { on: "step-begins", step: "end", who: "you" },
      targets: ["creature-an-opponent-controls"],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "add-counter", target: 0, counter: "bounty", amount: 1 },
          {
            kind: "grant-triggered",
            target: 0,
            duration: { whileCounter: "bounty" },
            ability: {
              trigger: { on: "dies", who: "self" },
              targets: [],
              effect: {
                kind: "sequence",
                effects: [
                  { kind: "draw", amount: 1, who: "each-opponent" },
                  { kind: "gain-life", amount: 2, who: "each-opponent" },
                ],
              },
              resolve: null,
              text: BOUNTY_TEXT,
            },
          },
        ],
      },
      resolve: null,
      text: `At the beginning of your end step, put a bounty counter on target creature an opponent controls. For as long as that creature has a bounty counter on it, it has "${BOUNTY_TEXT}"`,
    },
  ],
});
