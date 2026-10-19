import { defineCard } from "../define.js";

// EDHREC rank 18438.

const TRAIL_TEXT =
  "Pheromone Trail — When this creature enters, if a creature entered the battlefield under an opponent's control this turn, create a 3/3 green Tyranid Warrior creature token with trample.";

export default defineCard({
  name: "Lictor",
  manaCost: "{3}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Tyranid"],
  power: 3,
  toughness: 3,
  keywords: ["flash"],
  text: `Flash\n${TRAIL_TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      condition: { kind: "turn-history", what: "entered", who: "opponent", filter: { type: "creature" } },
      targets: [],
      effect: { kind: "create-token", token: "Tyranid Warrior Token", count: 1 },
      resolve: null,
      text: TRAIL_TEXT,
    },
  ],
});
