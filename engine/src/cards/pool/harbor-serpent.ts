import { defineCard } from "../define.js";

// Magic 2013. "Five or more Islands on the battlefield" counts every
// player's, asked as attackers are declared.

const ISLANDWALK = "Islandwalk (This creature can't be blocked as long as defending player controls an Island.)";
const TEXT = "This creature can't attack unless there are five or more Islands on the battlefield.";

export default defineCard({
  name: "Harbor Serpent",
  manaCost: "{4}{U}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Serpent"],
  power: 5,
  toughness: 5,
  keywords: ["islandwalk"],
  text: `${ISLANDWALK}\n${TEXT}`,
  static: [
    {
      affects: { scope: "self" },
      restrictions: ["cant-attack"],
      condition: {
        kind: "not",
        of: { kind: "controls", filter: { subtype: "Island" }, atLeast: 5, anyController: true },
      },
      text: TEXT,
    },
  ],
});
