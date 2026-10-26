import { defineCard } from "../define.js";

const HEROIC =
  "Heroic — Whenever you cast a spell that targets this creature, put a +1/+1 counter on this creature, then scry 1.";

export default defineCard({
  name: "Battlewise Hoplite",
  manaCost: "{W}{U}",
  colors: ["W", "U"],
  types: ["creature"],
  subtypes: ["Human", "Soldier"],
  power: 2,
  toughness: 2,
  text: "Heroic — Whenever you cast a spell that targets this creature, put a +1/+1 counter on this creature, then scry 1. (To scry 1, look at the top card of your library, then you may put that card on the bottom.)",
  triggered: [
    {
      trigger: { on: "cast-spell", who: "you", filter: { targets: { source: true } } },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "add-counter", target: "source", counter: "+1/+1", amount: 1 },
          { kind: "scry", amount: 1 },
        ],
      },
      resolve: null,
      text: HEROIC,
    },
  ],
});
