import { defineCard } from "../define.js";

// Activated twice in a turn it has the trigger twice: each grant is its own
// ability on the land, and the second activation's P/T overwrites the first's.
const ANIMATE =
  '{2}{R}{G}: Until end of turn, this land becomes a 3/3 red and green Elemental creature with "Whenever this creature attacks, put a +1/+1 counter on it." It\'s still a land.';

export default defineCard({
  name: "Raging Ravine",
  colors: [],
  types: ["land"],
  text: `This land enters tapped.\n{T}: Add {R} or {G}.\n${ANIMATE}`,
  static: [
    {
      affects: { scope: "self" },
      replacement: { event: "enters-battlefield", tapped: true },
      text: "This land enters tapped.",
    },
  ],
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: [],
      effect: { kind: "add-mana", mana: { oneOf: ["R", "G"] }, amount: 1 },
      resolve: null,
      text: "{T}: Add {R} or {G}.",
    },
    {
      cost: { mana: "{2}{R}{G}", tap: false },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          {
            kind: "become",
            target: "source",
            power: 3,
            toughness: 3,
            addTypes: ["creature"],
            addSubtypes: ["Elemental"],
            setColors: ["R", "G"],
            duration: "end-of-turn",
          },
          {
            kind: "grant-triggered",
            target: "source",
            ability: {
              trigger: { on: "attacks", who: "self" },
              targets: [],
              effect: { kind: "add-counter", target: "source", counter: "+1/+1", amount: 1 },
              resolve: null,
              text: "Whenever this creature attacks, put a +1/+1 counter on it.",
            },
            duration: "end-of-turn",
          },
        ],
      },
      resolve: null,
      text: ANIMATE,
    },
  ],
});
