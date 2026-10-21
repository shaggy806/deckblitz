import { defineCard } from "../define.js";

const TEXT =
  "Whenever you cast a spell that targets this creature, put a +1/+1 counter on this creature, then scry 1.";

// You scry 1 even if the counter can't be put on it (the ruling).
export default defineCard({
  name: "Tenth District Legionnaire",
  manaCost: "{R}{W}",
  colors: ["W", "R"],
  types: ["creature"],
  subtypes: ["Human", "Soldier"],
  power: 2,
  toughness: 2,
  keywords: ["haste"],
  text: `Haste\n${TEXT}`,
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
      text: TEXT,
    },
  ],
});
