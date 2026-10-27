import { defineCard } from "../define.js";

// With no untapped land, that player sacrifices nothing (its ruling).
const TEXT = "At the beginning of each player's end step, that player sacrifices an untapped land of their choice.";

export default defineCard({
  name: "Stoneshaker Shaman",
  manaCost: "{2}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Human", "Shaman"],
  power: 1,
  toughness: 1,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "step-begins", step: "end", who: "any" },
      targets: [],
      effect: { kind: "sacrifice", who: "active-player", filter: { type: "land", tapped: false }, count: 1 },
      resolve: null,
      text: TEXT,
    },
  ],
});
