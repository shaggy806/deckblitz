import { defineCard } from "../define.js";

// One grant over both types: a Goblin Elemental has menace once (the ruling).
export default defineCard({
  name: "Caterwauling Boggart",
  manaCost: "{3}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Goblin", "Shaman"],
  power: 2,
  toughness: 2,
  text: "Goblins you control and Elementals you control have menace. (They can't be blocked except by two or more creatures.)",
  static: [
    {
      affects: {
        scope: "filter",
        filter: { type: "creature", controlledBy: "you", anyOf: [{ subtype: "Goblin" }, { subtype: "Elemental" }] },
      },
      grantKeywords: ["menace"],
      text: "Goblins you control and Elementals you control have menace.",
    },
  ],
});
