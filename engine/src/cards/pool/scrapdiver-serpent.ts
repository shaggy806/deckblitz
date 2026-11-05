import { defineCard } from "../define.js";

// EDHREC rank 21275.

export default defineCard({
  name: "Scrapdiver Serpent",
  manaCost: "{5}{U}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Serpent"],
  power: 5,
  toughness: 5,
  text: "This creature can't be blocked as long as defending player controls an artifact.",
  static: [
    {
      affects: { scope: "self" },
      grantKeywords: ["unblockable"],
      text: "This creature can't be blocked as long as defending player controls an artifact.",
      condition: {
        kind: "of-player",
        player: "defending-player",
        condition: { kind: "controls", filter: { type: "artifact" }, atLeast: 1 },
      },
    },
  ],
});
