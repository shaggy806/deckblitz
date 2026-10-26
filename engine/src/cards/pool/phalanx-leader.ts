import { defineCard } from "../define.js";

// EDHREC rank 11438. Heroic, as Akroan Skyguard has it: once per spell,
// however many of its targets this creature is.

export default defineCard({
  name: "Phalanx Leader",
  manaCost: "{W}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Human", "Soldier"],
  power: 1,
  toughness: 1,
  text: "Heroic — Whenever you cast a spell that targets this creature, put a +1/+1 counter on each creature you control.",
  triggered: [
    {
      trigger: { on: "cast-spell", who: "you", filter: { targets: { source: true } } },
      targets: [],
      effect: { kind: "add-counter-all", filter: { type: "creature", controlledBy: "you" }, counter: "+1/+1", amount: 1 },
      resolve: null,
      text: "Heroic — Whenever you cast a spell that targets this creature, put a +1/+1 counter on each creature you control.",
    },
  ],
});
