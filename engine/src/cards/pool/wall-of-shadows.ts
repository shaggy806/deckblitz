import { defineCard } from "../define.js";

// EDHREC rank 22133. "Spells that can target only Walls" reads the spell as a
// whole, every mode and slot (its ruling: a modal spell with a mode that can
// target a non-Wall isn't one) — the `aimingOnly` prohibition.

const PREVENT_TEXT = "Prevent all damage that would be dealt to this creature by creatures it's blocking.";
const UNTARGETABLE_TEXT =
  "This creature can't be the target of spells that can target only Walls or of abilities that can target only Walls.";

export default defineCard({
  name: "Wall of Shadows",
  manaCost: "{1}{B}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Wall"],
  power: 0,
  toughness: 1,
  keywords: ["defender"],
  text: "Defender (This creature can't attack.)\n" + PREVENT_TEXT + "\n" + UNTARGETABLE_TEXT,
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
    {
      affects: { scope: "self" },
      prohibits: [{ act: "be-targeted", object: { isSource: true }, aimingOnly: "Wall" }],
      text: UNTARGETABLE_TEXT,
    },
  ],
});
