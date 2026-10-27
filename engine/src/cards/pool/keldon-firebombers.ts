import { defineCard } from "../define.js";

// Prophecy. EDHREC rank 17350. Each player chooses the three lands they keep
// (Planetary Annihilation's `sacrifice-all-but`).

const TEXT = "When this creature enters, each player sacrifices all lands they control except for three.";

export default defineCard({
  name: "Keldon Firebombers",
  manaCost: "{3}{R}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Human", "Soldier"],
  power: 3,
  toughness: 3,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: { kind: "sacrifice-all-but", who: "each-player", keep: 3, filter: { type: "land" } },
      resolve: null,
      text: TEXT,
    },
  ],
});
