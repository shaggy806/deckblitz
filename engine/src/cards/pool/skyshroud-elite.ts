import { defineCard } from "../define.js";

export default defineCard({
  name: "Skyshroud Elite",
  manaCost: "{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Elf"],
  power: 1,
  toughness: 1,
  text: "This creature gets +1/+2 as long as an opponent controls a nonbasic land.",
  static: [
    {
      affects: { scope: "self" },
      condition: { kind: "opponent-controls", filter: { type: "land", notSupertype: "basic" }, atLeast: 1 },
      grantPt: [1, 2],
      text: "This creature gets +1/+2 as long as an opponent controls a nonbasic land.",
    },
  ],
});
