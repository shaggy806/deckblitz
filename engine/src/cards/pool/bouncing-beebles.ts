import { defineCard } from "../define.js";

// Urza's Legacy. The defending player is the one it attacks (rule 802.2a):
// in multiplayer it may be unblockable against one opponent and not another.

const TEXT = "This creature can't be blocked as long as defending player controls an artifact.";

export default defineCard({
  name: "Bouncing Beebles",
  manaCost: "{2}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Beeble"],
  power: 2,
  toughness: 2,
  text: TEXT,
  static: [
    {
      affects: { scope: "self" },
      condition: {
        kind: "of-player",
        player: "defending-player",
        condition: { kind: "controls", filter: { type: "artifact" }, atLeast: 1 },
      },
      grantKeywords: ["unblockable"],
      text: TEXT,
    },
  ],
});
