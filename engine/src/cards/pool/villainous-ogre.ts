import { defineCard } from "../define.js";

// Champions of Kamigawa (CHK). EDHREC rank 31286. Gobhobbler Rats' shape: a
// conditional static granting the regeneration ability itself, so the Ogre
// has it only while you control a Demon.

const GRANT_TEXT = 'As long as you control a Demon, this creature has "{B}: Regenerate this creature."';

export default defineCard({
  name: "Villainous Ogre",
  manaCost: "{2}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Ogre", "Warrior"],
  power: 3,
  toughness: 2,
  text: `This creature can't block.\n${GRANT_TEXT}`,
  static: [
    {
      affects: { scope: "self" },
      restrictions: ["cant-block"],
      text: "This creature can't block.",
    },
    {
      affects: { scope: "self" },
      condition: { kind: "controls", filter: { subtype: "Demon" }, atLeast: 1 },
      grantsActivated: [
        {
          cost: { mana: "{B}", tap: false },
          targets: [],
          effect: { kind: "regenerate", target: "source" },
          resolve: null,
          text: "{B}: Regenerate this creature.",
        },
      ],
      text: GRANT_TEXT,
    },
  ],
});
