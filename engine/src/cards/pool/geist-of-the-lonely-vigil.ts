import { defineCard } from "../define.js";

const DELIRIUM_TEXT =
  "Delirium — This creature can attack as though it didn't have defender as long as there are four or more card types among cards in your graveyard.";

export default defineCard({
  name: "Geist of the Lonely Vigil",
  manaCost: "{1}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Spirit", "Cleric"],
  power: 2,
  toughness: 3,
  keywords: ["defender", "flying"],
  text: `Defender, flying\n${DELIRIUM_TEXT}`,
  static: [
    {
      affects: { scope: "self" },
      condition: { kind: "delirium" },
      canAttackAsThoughNoDefender: true,
      text: DELIRIUM_TEXT,
    },
  ],
});
