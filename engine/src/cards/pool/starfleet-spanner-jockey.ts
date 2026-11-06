import { defineCard } from "../define.js";

// EDHREC rank 32708.

const ATTACK_TEXT =
  "As long as you've cast a noncreature spell this turn, this creature can attack as though it didn't have defender.";

export default defineCard({
  name: "Starfleet Spanner Jockey",
  manaCost: "{1}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Human", "Artificer"],
  power: 3,
  toughness: 3,
  keywords: ["defender"],
  text: `Defender\n${ATTACK_TEXT}`,
  static: [
    {
      affects: { scope: "self" },
      condition: { kind: "cast-this-turn", filter: { notTypes: ["creature"] } },
      canAttackAsThoughNoDefender: true,
      text: ATTACK_TEXT,
    },
  ],
});
