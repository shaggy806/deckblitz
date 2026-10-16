import { defineCard } from "../define.js";

// The Lost Caverns of Ixalan. Mechan Shieldmate's attack permission: the
// `turn-history` "entered" condition matches each permanent as it entered,
// so an artifact that has since stopped being one, or changed hands, still
// counts (the ruling).

const ATTACK_TEXT =
  "As long as an artifact entered the battlefield under your control this turn, this creature can attack as though it didn't have defender.";

export default defineCard({
  name: "Shipwreck Sentry",
  manaCost: "{1}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Human", "Pirate"],
  power: 3,
  toughness: 3,
  keywords: ["defender"],
  text: `Defender\n${ATTACK_TEXT}`,
  static: [
    {
      affects: { scope: "self" },
      condition: { kind: "turn-history", what: "entered", filter: { type: "artifact" } },
      canAttackAsThoughNoDefender: true,
      text: ATTACK_TEXT,
    },
  ],
});
