import { defineCard } from "../define.js";

const TEXT =
  "As long as an opponent has eight or more cards in their graveyard, this creature can attack as though it didn't have defender and it can't be blocked.";

export default defineCard({
  name: "Expedition Lookout",
  manaCost: "{1}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Merfolk", "Rogue"],
  power: 2,
  toughness: 3,
  keywords: ["defender"],
  text: `Defender\n${TEXT}`,
  static: [
    {
      affects: { scope: "self" },
      condition: { kind: "cards-in-graveyard", whose: "an-opponent", atLeast: 8 },
      canAttackAsThoughNoDefender: true,
      grantKeywords: ["unblockable"],
      text: TEXT,
    },
  ],
});
