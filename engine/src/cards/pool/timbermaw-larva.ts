import { defineCard } from "../define.js";

// EDHREC rank 26093. The Forests are counted as the trigger resolves.

const TEXT = "Whenever this creature attacks, it gets +1/+1 until end of turn for each Forest you control.";
const FORESTS = { countOf: { subtype: "Forest", controlledBy: "you" } } as const;

export default defineCard({
  name: "Timbermaw Larva",
  manaCost: "{3}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Beast"],
  power: 2,
  toughness: 2,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "attacks", who: "self" },
      targets: [],
      effect: { kind: "modify-pt", target: "source", power: FORESTS, toughness: FORESTS, duration: "end-of-turn" },
      resolve: null,
      text: TEXT,
    },
  ],
});
