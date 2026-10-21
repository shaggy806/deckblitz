import { defineCard } from "../define.js";

// EDHREC rank 18213.

const TEXT = "Whenever this creature attacks, another target attacking non-Human creature can't be blocked this turn.";

export default defineCard({
  name: "Mistford River Turtle",
  manaCost: "{3}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Turtle"],
  power: 1,
  toughness: 5,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "attacks", who: "self" },
      targets: [
        {
          kind: "other",
          of: { kind: "permanent", filter: { type: "creature", attacking: true, notSubtypes: ["Human"] } },
        },
      ],
      effect: { kind: "grant-keyword", target: 0, keyword: "unblockable", duration: "end-of-turn" },
      resolve: null,
      text: TEXT,
    },
  ],
});
