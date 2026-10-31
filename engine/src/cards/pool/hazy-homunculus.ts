import { defineCard } from "../define.js";

const EVASION = "This creature can't be blocked as long as defending player controls an untapped land.";

export default defineCard({
  name: "Hazy Homunculus",
  manaCost: "{1}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Homunculus", "Illusion"],
  power: 1,
  toughness: 1,
  text: EVASION,
  static: [
    {
      affects: { scope: "self" },
      condition: {
        kind: "of-player",
        player: "defending-player",
        condition: { kind: "controls", filter: { type: "land", tapped: false }, atLeast: 1 },
      },
      grantKeywords: ["unblockable"],
      text: EVASION,
    },
  ],
});
