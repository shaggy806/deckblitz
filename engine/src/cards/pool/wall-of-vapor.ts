import { defineCard } from "../define.js";

const PREVENT_TEXT = "Prevent all damage that would be dealt to this creature by creatures it's blocking.";

export default defineCard({
  name: "Wall of Vapor",
  manaCost: "{3}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Wall"],
  power: 0,
  toughness: 1,
  keywords: ["defender"],
  text: "Defender (This creature can't attack.)\n" + PREVENT_TEXT,
  static: [
    {
      affects: { scope: "self" },
      replacement: {
        event: "would-deal-damage",
        instead: { prevent: true },
        to: "self",
        source: { types: ["creature"], blockingRelation: { relation: "blocked-by" } },
      },
      text: PREVENT_TEXT,
    },
  ],
});
