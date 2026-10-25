import { defineCard } from "../define.js";

// Magic 2015. EDHREC rank 31293.
//
// Any player's Mountain counts (the ruling): "there is a Mountain" is you or
// some opponent controlling one. Read only as attackers are declared, so it
// stays attacking if the Mountains leave afterwards.

const TEXT = "This creature can't attack unless there is a Mountain on the battlefield.";

export default defineCard({
  name: "Glacial Crasher",
  manaCost: "{4}{U}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Elemental"],
  power: 5,
  toughness: 5,
  keywords: ["trample"],
  text: `Trample (This creature can deal excess combat damage to the player or planeswalker it's attacking.)\n${TEXT}`,
  static: [
    {
      affects: { scope: "self" },
      condition: {
        kind: "not",
        of: {
          kind: "any",
          of: [
            { kind: "controls", filter: { subtype: "Mountain" }, atLeast: 1 },
            { kind: "opponent-controls", filter: { subtype: "Mountain" }, atLeast: 1 },
          ],
        },
      },
      restrictions: ["cant-attack"],
      text: TEXT,
    },
  ],
});
