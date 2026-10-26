import { defineCard } from "../define.js";

// Ruling: the untapped creatures are counted as the ability resolves — other
// attackers are already tapped by then (unless they have vigilance).

const UNTAPPED = { countOf: { type: "creature", controlledBy: "you", tapped: false } } as const;

export default defineCard({
  name: "Knotvine Paladin",
  manaCost: "{G}{W}",
  colors: ["W", "G"],
  types: ["creature"],
  subtypes: ["Human", "Knight"],
  power: 2,
  toughness: 2,
  text: "Whenever this creature attacks, it gets +1/+1 until end of turn for each untapped creature you control.",
  triggered: [
    {
      trigger: { on: "attacks", who: "self" },
      targets: [],
      effect: { kind: "modify-pt", target: "source", power: UNTAPPED, toughness: UNTAPPED, duration: "end-of-turn" },
      resolve: null,
      text: "Whenever this creature attacks, it gets +1/+1 until end of turn for each untapped creature you control.",
    },
  ],
});
