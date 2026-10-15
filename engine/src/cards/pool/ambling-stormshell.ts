import { defineCard } from "../define.js";

// EDHREC rank 14260.

const ATTACK_TEXT = "Whenever this creature attacks, put three stun counters on it and draw three cards.";
const TURTLE_TEXT = "Whenever you cast a Turtle spell, untap this creature.";

export default defineCard({
  name: "Ambling Stormshell",
  manaCost: "{3}{U}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Turtle"],
  power: 5,
  toughness: 9,
  text: `Ward {2}\n${ATTACK_TEXT} (If a permanent with a stun counter would become untapped, remove one from it instead.)\n${TURTLE_TEXT}`,
  triggered: [
    {
      trigger: { on: "becomes-target", who: "self", byOpponentOnly: true },
      targets: [],
      effect: { kind: "ward", cost: { mana: "{2}" } },
      resolve: null,
      text: "Ward {2}",
    },
    {
      trigger: { on: "attacks", who: "self" },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "add-counter", target: "source", counter: "stun", amount: 3 },
          { kind: "draw", amount: 3 },
        ],
      },
      resolve: null,
      text: ATTACK_TEXT,
    },
    {
      trigger: { on: "cast-spell", who: "you", filter: { subtype: "Turtle" } },
      targets: [],
      effect: { kind: "untap", target: "source" },
      resolve: null,
      text: TURTLE_TEXT,
    },
  ],
});
