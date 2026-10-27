import { defineCard } from "../define.js";

// EDHREC rank 19323. Mirrodin. Kuon's Essence's shape, over artifacts.

const TEXT = "At the beginning of each player's upkeep, that player sacrifices an artifact of their choice.";

export default defineCard({
  name: "Molder Slug",
  manaCost: "{3}{G}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Slug", "Beast"],
  power: 4,
  toughness: 6,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "step-begins", step: "upkeep", who: "any" },
      targets: [],
      effect: { kind: "sacrifice", who: "active-player", filter: { type: "artifact" }, count: 1 },
      resolve: null,
      text: TEXT,
    },
  ],
});
