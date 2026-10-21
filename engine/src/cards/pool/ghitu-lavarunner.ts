import { defineCard } from "../define.js";

export default defineCard({
  name: "Ghitu Lavarunner",
  manaCost: "{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Human", "Wizard"],
  power: 1,
  toughness: 2,
  text: "As long as there are two or more instant and/or sorcery cards in your graveyard, this creature gets +1/+0 and has haste. (It can attack and {T} as soon as it comes under your control.)",
  static: [
    {
      affects: { scope: "self" },
      condition: { kind: "cards-in-graveyard", atLeast: 2, filter: { typesAnyOf: ["instant", "sorcery"] } },
      grantPt: [1, 0],
      grantKeywords: ["haste"],
      text: "As long as there are two or more instant and/or sorcery cards in your graveyard, this creature gets +1/+0 and has haste.",
    },
  ],
});
