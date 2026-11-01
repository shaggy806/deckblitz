import { defineCard } from "../define.js";

// Rule 702.16k, the player's: an object with no controller, such as a card in a
// graveyard, is its owner's (the ruling).

const TEXT =
  "You have protection from each of your opponents. (You can't be dealt damage, enchanted, or targeted by anything controlled by your opponents.)";

export default defineCard({
  name: "Absolute Virtue",
  manaCost: "{6}{W}{U}",
  colors: ["W", "U"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Avatar", "Warrior"],
  power: 8,
  toughness: 8,
  keywords: ["flying"],
  cantBeCountered: true,
  text: `This spell can't be countered.\nFlying\n${TEXT}`,
  static: [{ affects: { scope: "self" }, playerProtection: { fromPlayers: "opponents" }, text: TEXT }],
});
