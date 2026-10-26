import { defineCard } from "../define.js";

// Stronghold (STH). EDHREC rank 31857. The untap restriction is gated on any
// one opponent controlling two or more creatures, read in the untap step.

export default defineCard({
  name: "Walking Dream",
  manaCost: "{3}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Illusion"],
  power: 3,
  toughness: 3,
  text: "This creature can't be blocked.\nThis creature doesn't untap during your untap step if an opponent controls two or more creatures.",
  static: [
    {
      affects: { scope: "self" },
      grantKeywords: ["unblockable"],
      text: "This creature can't be blocked.",
    },
    {
      affects: { scope: "self" },
      doesntUntap: true,
      condition: { kind: "opponent-controls", filter: { type: "creature" }, atLeast: 2 },
      text: "This creature doesn't untap during your untap step if an opponent controls two or more creatures.",
    },
  ],
});
