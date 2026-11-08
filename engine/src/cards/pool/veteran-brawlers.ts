import { defineCard } from "../define.js";

// EDHREC rank 28189.

export default defineCard({
  name: "Veteran Brawlers",
  manaCost: "{1}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Human", "Soldier"],
  power: 4,
  toughness: 4,
  text: "This creature can't attack if defending player controls an untapped land.\nThis creature can't block if you control an untapped land.",
  static: [
    {
      affects: { scope: "self" },
      restrictions: [{ kind: "cant-attack", ifDefender: { controls: { type: "land", tapped: false } } }],
      text: "This creature can't attack if defending player controls an untapped land.",
    },
    {
      affects: { scope: "self" },
      condition: { kind: "controls", filter: { type: "land", tapped: false }, atLeast: 1 },
      restrictions: ["cant-block"],
      text: "This creature can't block if you control an untapped land.",
    },
  ],
});
