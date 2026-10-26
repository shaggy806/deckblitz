import { defineCard } from "../define.js";

// EDHREC rank 20505.
const HASTE_TEXT = "This creature has haste as long as you control a red creature.";
const WITHER_TEXT =
  "This creature has wither as long as you control a green creature. (It deals damage to creatures in the form of -1/-1 counters.)";

export default defineCard({
  name: "Blazethorn Scarecrow",
  manaCost: "{5}",
  colors: [],
  types: ["artifact", "creature"],
  subtypes: ["Scarecrow"],
  power: 3,
  toughness: 3,
  text: `${HASTE_TEXT}\n${WITHER_TEXT}`,
  static: [
    {
      affects: { scope: "self" },
      condition: { kind: "controls", filter: { type: "creature", colors: ["R"] }, atLeast: 1, countsSelf: true },
      grantKeywords: ["haste"],
      text: HASTE_TEXT,
    },
    {
      affects: { scope: "self" },
      condition: { kind: "controls", filter: { type: "creature", colors: ["G"] }, atLeast: 1, countsSelf: true },
      grantKeywords: ["wither"],
      text: WITHER_TEXT,
    },
  ],
});
