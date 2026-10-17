import { defineCard } from "../define.js";

// EDHREC rank 15559.
//
// Rulings:
//   [2023-11-03] If Minas Tirith Garrison is untapped as its last ability resolves, it can be
//     tapped for its own last ability.
//   [2023-11-03] If an attacking Human is tapped for Minas Tirith Garrison's ability (perhaps
//     because it has vigilance or it was untapped after being declared as an attacker), that Human
//     remains an attacking creature.
//   [2023-11-03] You choose how many and which creatures to tap while Minas Tirith Garrison's last
//     ability is resolving. No player may take any other actions between the time you make this
//     choice and the time at which you draw cards.
//
// Orphans of the Wheat's shape: choose any number of untapped Humans you
// control (the Garrison itself among them, a Human), tap them, then draw one
// for each tapped this way.

const PT_TEXT = "Minas Tirith Garrison's power is equal to the number of cards in your hand.";
const ATTACK_TEXT =
  "Whenever this creature attacks, you may tap any number of untapped Humans you control. Draw a card for each Human tapped this way.";

export default defineCard({
  name: "Minas Tirith Garrison",
  manaCost: "{3}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Human", "Soldier"],
  power: 0,
  toughness: 5,
  text: `${PT_TEXT}\n${ATTACK_TEXT}`,
  static: [
    {
      affects: { scope: "self" },
      setBasePtFromCount: { countOf: "cards-in-your-hand", plusPower: 0, plusToughness: 0, only: "power" },
      text: PT_TEXT,
    },
  ],
  triggered: [
    {
      trigger: { on: "attacks", who: "self" },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          {
            kind: "choose-permanents",
            filter: { subtype: "Human", controlledBy: "you", tapped: false },
            min: 0,
            upTo: { countOf: { subtype: "Human", controlledBy: "you", tapped: false } },
            then: { kind: "tap", target: 0 },
            prompt: "Tap any number of untapped Humans you control",
          },
          { kind: "draw", amount: { thisWay: "tapped" } },
        ],
      },
      resolve: null,
      text: ATTACK_TEXT,
    },
  ],
});
