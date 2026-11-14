import { defineCard } from "../define.js";

// A result modified to 0 or less deals no damage (the ruling). The damage is
// dealt by the creature as it last existed.
const DIES_TEXT =
  "When this creature dies, roll a six-sided die. If the result is 4 or less, this creature deals that much damage to you.";

export default defineCard({
  name: "Non-Human Cannonball",
  manaCost: "{2}{R}",
  colors: ["R"],
  types: ["artifact", "creature"],
  subtypes: ["Clown", "Robot"],
  power: 4,
  toughness: 3,
  text: DIES_TEXT,
  triggered: [
    {
      trigger: { on: "dies", who: "self" },
      targets: [],
      effect: {
        kind: "roll-dice",
        sides: 6,
        then: {
          kind: "conditional",
          condition: {
            kind: "all",
            of: [
              { kind: "amounts", left: { roll: "total" }, op: "lte", right: 4 },
              { kind: "amounts", left: { roll: "total" }, op: "gte", right: 1 },
            ],
          },
          then: { kind: "damage", amount: { roll: "total" }, who: "you" },
        },
      },
      resolve: null,
      text: DIES_TEXT,
    },
  ],
});
