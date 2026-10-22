import { defineCard } from "../define.js";

// EDHREC rank 29408. Ixalan. "If you control a Dinosaur" is an
// intervening-if (rule 603.4): it doesn't trigger without one, and does
// nothing if there's none as it resolves (the rulings).

export default defineCard({
  name: "Tilonalli's Knight",
  manaCost: "{1}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Human", "Knight"],
  power: 2,
  toughness: 2,
  text: "Whenever this creature attacks, if you control a Dinosaur, this creature gets +1/+1 until end of turn.",
  triggered: [
    {
      trigger: { on: "attacks", who: "self" },
      condition: { kind: "controls", filter: { subtype: "Dinosaur" }, atLeast: 1 },
      targets: [],
      effect: { kind: "modify-pt", target: "source", power: 1, toughness: 1, duration: "end-of-turn" },
      resolve: null,
      text: "Whenever this creature attacks, if you control a Dinosaur, this creature gets +1/+1 until end of turn.",
    },
  ],
});
