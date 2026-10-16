import { defineCard } from "../define.js";

// EDHREC rank 20615. Ruling: not an intervening "if" — it always triggers and
// checks only as it resolves (a `conditional` effect, which counts this
// creature itself).
const ATTACK_TEXT =
  "Whenever this creature attacks, create a 3/1 red Dinosaur creature token if you control a creature with power 4 or greater.";

export default defineCard({
  name: "Scalestorm Summoner",
  manaCost: "{2}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Human", "Warlock"],
  power: 3,
  toughness: 3,
  text: ATTACK_TEXT,
  triggered: [
    {
      trigger: { on: "attacks", who: "self" },
      targets: [],
      effect: {
        kind: "conditional",
        condition: { kind: "controls", filter: { type: "creature", power: { op: "gte", n: 4 } }, atLeast: 1 },
        then: { kind: "create-token", token: "3/1 Dinosaur Token", count: 1 },
      },
      resolve: null,
      text: ATTACK_TEXT,
    },
  ],
});
