import { defineCard } from "../define.js";
import { CELEBRATION_CONDITION } from "../helpers.js";

// EDHREC rank 27169.
//
// Celebration (an ability word — rule 207.2c) reads the turn's history, not the
// board: nonland permanents that entered under your control this turn count
// though they've left or changed control since (the rulings).

export default defineCard({
  name: "Belligerent of the Ball",
  manaCost: "{2}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Ogre", "Warrior"],
  power: 3,
  toughness: 3,
  text: "Celebration — At the beginning of combat on your turn, if two or more nonland permanents entered the battlefield under your control this turn, target creature you control gets +1/+0 and gains menace until end of turn. (It can't be blocked except by two or more creatures.)",
  triggered: [
    {
      trigger: { on: "step-begins", step: "begin-combat", who: "you" },
      targets: ["creature-you-control"],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "modify-pt", target: 0, power: 1, toughness: 0, duration: "end-of-turn" },
          { kind: "grant-keyword", target: 0, keyword: "menace", duration: "end-of-turn" },
        ],
      },
      resolve: null,
      text: "Celebration — At the beginning of combat on your turn, if two or more nonland permanents entered the battlefield under your control this turn, target creature you control gets +1/+0 and gains menace until end of turn.",
      condition: CELEBRATION_CONDITION,
    },
  ],
});
