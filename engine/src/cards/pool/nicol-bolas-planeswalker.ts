import { defineCard } from "../define.js";

// EDHREC rank 7356. The −9's discard and sacrifice aren't tied to the damage
// (its ruling), and name the target player or that planeswalker's controller.

const PLUS = "+3: Destroy target noncreature permanent.";
const MINUS = "−2: Gain control of target creature.";
const ULTIMATE =
  "−9: Nicol Bolas deals 7 damage to target player or planeswalker. That player or that planeswalker's controller discards seven cards, then sacrifices seven permanents of their choice.";

export default defineCard({
  name: "Nicol Bolas, Planeswalker",
  manaCost: "{4}{U}{B}{B}{R}",
  colors: ["U", "B", "R"],
  supertypes: ["legendary"],
  types: ["planeswalker"],
  subtypes: ["Bolas"],
  loyalty: 5,
  text: `${PLUS}\n${MINUS}\n${ULTIMATE}`,
  activated: [
    {
      loyaltyCost: 3,
      cost: { mana: null, tap: false },
      targets: [{ kind: "permanent", filter: { notTypes: ["creature"] } }],
      effect: { kind: "destroy", target: 0 },
      resolve: null,
      text: PLUS,
    },
    {
      loyaltyCost: -2,
      cost: { mana: null, tap: false },
      targets: ["creature"],
      effect: { kind: "gain-control", target: 0, untilEndOfTurn: false },
      resolve: null,
      text: MINUS,
    },
    {
      loyaltyCost: -9,
      cost: { mana: null, tap: false },
      targets: ["player-or-planeswalker"],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "damage", amount: 7, target: 0 },
          {
            kind: "for-each-player",
            who: { controllerOfTarget: 0 },
            effect: {
              kind: "sequence",
              effects: [
                { kind: "discard", target: "that-player", amount: 7 },
                { kind: "sacrifice", who: "that-player", filter: {}, count: 7 },
              ],
            },
          },
        ],
      },
      resolve: null,
      text: ULTIMATE,
    },
  ],
});
