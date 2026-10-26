import { defineCard } from "../define.js";

const WITHER_TEXT =
  "This creature has wither as long as you control a green creature. (It deals damage to creatures in the form of -1/-1 counters.)";
const VIGILANCE_TEXT = "This creature has vigilance as long as you control a white creature.";

export default defineCard({
  name: "Thornwatch Scarecrow",
  manaCost: "{6}",
  colors: [],
  types: ["artifact", "creature"],
  subtypes: ["Scarecrow"],
  power: 4,
  toughness: 4,
  text: `${WITHER_TEXT}\n${VIGILANCE_TEXT}`,
  static: [
    {
      affects: { scope: "self" },
      condition: { kind: "controls", filter: { type: "creature", colors: ["G"] }, atLeast: 1, countsSelf: true },
      grantKeywords: ["wither"],
      text: WITHER_TEXT,
    },
    {
      affects: { scope: "self" },
      condition: { kind: "controls", filter: { type: "creature", colors: ["W"] }, atLeast: 1, countsSelf: true },
      grantKeywords: ["vigilance"],
      text: VIGILANCE_TEXT,
    },
  ],
});
