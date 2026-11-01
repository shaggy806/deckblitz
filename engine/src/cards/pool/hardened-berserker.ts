import { defineCard } from "../define.js";

const TEXT = "Whenever this creature attacks, the next spell you cast this turn costs {1} less to cast.";

export default defineCard({
  name: "Hardened Berserker",
  manaCost: "{2}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Human", "Berserker"],
  power: 3,
  toughness: 2,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "attacks", who: "self" },
      targets: [],
      effect: { kind: "grant-spells-this-turn", next: true, reduceGeneric: 1 },
      resolve: null,
      text: TEXT,
    },
  ],
});
