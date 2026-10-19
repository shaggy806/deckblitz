import { defineCard } from "../define.js";

// EDHREC rank 15431.
//
// A conditional `grantPtPerCount` on itself: both halves of the condition are read live, and X
// is the number of Mountains you control (any Mountain, basic or not).

const TEXT =
  "As long as it's your turn and you control four or more Mountains, this creature gets +X/+0, where X is the number of Mountains you control.";
const MOUNTAINS = { subtype: "Mountain", controlledBy: "you" } as const;

export default defineCard({
  name: "Sardian Cliffstomper",
  manaCost: "{1}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Minotaur", "Barbarian"],
  power: 0,
  toughness: 4,
  text: TEXT,
  static: [
    {
      affects: { scope: "self" },
      condition: {
        kind: "all",
        of: [{ kind: "your-turn" }, { kind: "controls", filter: MOUNTAINS, atLeast: 4 }],
      },
      grantPtPerCount: { filter: MOUNTAINS, pt: [1, 0] },
      text: TEXT,
    },
  ],
});
