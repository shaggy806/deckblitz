import { defineCard } from "../define.js";

const ISLANDS_TEXT = "All lands are Islands in addition to their other types.";
const ATTACK_TEXT = "Creatures without flying or islandwalk can't attack.";

export default defineCard({
  name: "Stormtide Leviathan",
  manaCost: "{5}{U}{U}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Leviathan"],
  power: 8,
  toughness: 8,
  keywords: ["islandwalk"],
  text: `Islandwalk (This creature can't be blocked as long as defending player controls an Island.)\n${ISLANDS_TEXT}\n${ATTACK_TEXT}`,
  static: [
    {
      affects: { scope: "filter", filter: { type: "land" } },
      addSubtypes: ["Island"],
      text: ISLANDS_TEXT,
    },
    {
      affects: { scope: "filter", filter: { type: "creature", notKeyword: "flying", not: { keyword: "islandwalk" } } },
      restrictions: ["cant-attack"],
      text: ATTACK_TEXT,
    },
  ],
});
