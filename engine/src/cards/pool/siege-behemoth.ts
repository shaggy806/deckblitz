import { defineCard } from "../define.js";

const STATIC_TEXT =
  "As long as this creature is attacking, for each creature you control, you may have that creature assign its combat damage as though it weren't blocked.";

// Each creature's choice is its own, made as combat damage is assigned while
// this creature is still attacking.
export default defineCard({
  name: "Siege Behemoth",
  manaCost: "{5}{G}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Beast"],
  power: 7,
  toughness: 4,
  keywords: ["hexproof"],
  text: `Hexproof\n${STATIC_TEXT}`,
  static: [
    {
      affects: { scope: "filter", filter: { type: "creature", controlledBy: "you" } },
      condition: { kind: "source", filter: { attacking: true } },
      assignAsThoughUnblocked: true,
      text: STATIC_TEXT,
    },
  ],
});
