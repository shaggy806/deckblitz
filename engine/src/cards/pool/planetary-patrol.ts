import { defineCard } from "../define.js";

// EDHREC rank 32515.

export default defineCard({
  name: "Planetary Patrol",
  manaCost: "{1}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Scout"],
  power: 2,
  toughness: 2,
  text: "Landfall — Whenever a land you control enters, this creature gets +1/+1 until end of turn.",
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "you-control", filter: { type: "land" } },
      targets: [],
      effect: { kind: "modify-pt", target: "source", power: 1, toughness: 1, duration: "end-of-turn" },
      resolve: null,
      text: "Landfall — Whenever a land you control enters, this creature gets +1/+1 until end of turn.",
    },
  ],
});
