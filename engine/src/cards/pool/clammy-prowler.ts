import { defineCard } from "../define.js";

// EDHREC rank 11515.
const TEXT = "Whenever this creature attacks, another target attacking creature can't be blocked this turn.";

export default defineCard({
  name: "Clammy Prowler",
  manaCost: "{3}{U}",
  colors: ["U"],
  types: ["enchantment", "creature"],
  subtypes: ["Horror"],
  power: 2,
  toughness: 5,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "attacks", who: "self" },
      targets: [{ kind: "other", of: { kind: "permanent", filter: { type: "creature", attacking: true } } }],
      effect: { kind: "grant-keyword", target: 0, keyword: "unblockable", duration: "end-of-turn" },
      resolve: null,
      text: TEXT,
    },
  ],
});
