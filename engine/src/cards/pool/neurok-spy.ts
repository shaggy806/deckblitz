import { defineCard } from "../define.js";

// Bouncing Beebles' text. The defending player is the one it attacks (rule
// 802.2a): at a table of four it's blockable by one opponent and not another.
const EVASION = "This creature can't be blocked as long as defending player controls an artifact.";

export default defineCard({
  name: "Neurok Spy",
  manaCost: "{2}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Human", "Rogue"],
  power: 2,
  toughness: 2,
  text: EVASION,
  static: [
    {
      affects: { scope: "self" },
      condition: {
        kind: "of-player",
        player: "defending-player",
        condition: { kind: "controls", filter: { type: "artifact" }, atLeast: 1 },
      },
      grantKeywords: ["unblockable"],
      text: EVASION,
    },
  ],
});
