import { defineCard } from "../define.js";

// Invasion (INV). EDHREC rank 30679.

const TEXT = "Whenever this creature becomes blocked by a green creature, destroy that creature. It can't be regenerated.";

export default defineCard({
  name: "Phyrexian Reaper",
  manaCost: "{4}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Phyrexian", "Zombie"],
  power: 3,
  toughness: 3,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "blocked-by", who: "self", blocker: { type: "creature", colors: ["G"] } },
      targets: [],
      effect: { kind: "destroy", target: "trigger-object", cantBeRegenerated: true },
      resolve: null,
      text: TEXT,
    },
  ],
});
