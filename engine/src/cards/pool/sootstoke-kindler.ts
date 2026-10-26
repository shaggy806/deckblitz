import { defineCard } from "../define.js";

// EDHREC rank 26895.

export default defineCard({
  name: "Sootstoke Kindler",
  manaCost: "{1}{B/R}",
  colors: ["B", "R"],
  types: ["creature"],
  subtypes: ["Elemental", "Shaman"],
  power: 1,
  toughness: 1,
  keywords: ["haste"],
  text: "Haste\n{T}: Target black or red creature gains haste until end of turn.",
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: [{ kind: "permanent", filter: { type: "creature", anyOf: [{ colors: ["B"] }, { colors: ["R"] }] } }],
      effect: { kind: "grant-keyword", target: 0, keyword: "haste", duration: "end-of-turn" },
      resolve: null,
      text: "{T}: Target black or red creature gains haste until end of turn.",
    },
  ],
});
