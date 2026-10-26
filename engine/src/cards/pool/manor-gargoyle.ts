import { defineCard } from "../define.js";

// EDHREC rank 22188.
//
// Indestructible only while it has defender: once the activated ability takes
// defender away, it's destructible again, and lethal damage marked on it
// earlier that turn destroys it (the ruling — state-based actions see it).
const INDESTRUCTIBLE = "This creature has indestructible as long as it has defender.";
const FLY = "{1}: Until end of turn, this creature loses defender and gains flying.";

export default defineCard({
  name: "Manor Gargoyle",
  manaCost: "{5}",
  colors: [],
  types: ["artifact", "creature"],
  subtypes: ["Gargoyle"],
  power: 4,
  toughness: 4,
  keywords: ["defender"],
  text: `Defender\n${INDESTRUCTIBLE}\n${FLY}`,
  static: [
    {
      affects: { scope: "self" },
      condition: { kind: "source", filter: { keyword: "defender" } },
      grantKeywords: ["indestructible"],
      text: INDESTRUCTIBLE,
    },
  ],
  activated: [
    {
      cost: { mana: "{1}", tap: false },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "lose-keywords", target: "source", keywords: ["defender"], duration: "end-of-turn" },
          { kind: "grant-keyword", target: "source", keyword: "flying", duration: "end-of-turn" },
        ],
      },
      resolve: null,
      text: FLY,
    },
  ],
});
