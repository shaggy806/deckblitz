import { defineCard } from "../define.js";

const CRIME_TEXT =
  "Whenever you commit a crime, create a tapped Treasure token. This ability triggers only once each turn.";
const DRAGON_TEXT =
  "Sacrifice three Treasures: Create a 4/4 red Scorpion Dragon creature token with flying and haste. Activate only as a sorcery.";

export default defineCard({
  name: "Magda, the Hoardmaster",
  manaCost: "{1}{R}",
  colors: ["R"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Dwarf", "Berserker"],
  power: 2,
  toughness: 2,
  text: `${CRIME_TEXT} (Targeting opponents, anything they control, and/or cards in their graveyards is a crime.)\n${DRAGON_TEXT}`,
  triggered: [
    {
      trigger: { on: "crime-committed", who: "you" },
      targets: [],
      effect: { kind: "create-token", token: "Treasure Token", count: 1, tapped: true },
      resolve: null,
      oncePerTurn: true,
      text: CRIME_TEXT,
    },
  ],
  activated: [
    {
      cost: { mana: null, tap: false, sacrifice: { filter: { subtype: "Treasure" }, count: 3 } },
      targets: [],
      effect: { kind: "create-token", token: "Scorpion Dragon Token", count: 1 },
      resolve: null,
      sorcerySpeed: true,
      text: DRAGON_TEXT,
    },
  ],
});
