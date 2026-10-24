import { defineCard } from "../define.js";

const TEXT = "As long as you control a Dragon, this creature gets +1/+1 and has flying and trample.";

export default defineCard({
  name: "Dragonloft Idol",
  manaCost: "{4}",
  colors: [],
  types: ["artifact", "creature"],
  subtypes: ["Gargoyle"],
  power: 3,
  toughness: 3,
  text: TEXT,
  static: [
    {
      affects: { scope: "self" },
      condition: { kind: "controls", filter: { subtype: "Dragon" }, atLeast: 1, countsSelf: true },
      grantPt: [1, 1],
      grantKeywords: ["flying", "trample"],
      text: TEXT,
    },
  ],
});
