import { defineCard } from "../define.js";

export default defineCard({
  name: "Crusading Knight",
  manaCost: "{2}{W}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Human", "Knight"],
  power: 2,
  toughness: 2,
  text: "Protection from black\nThis creature gets +1/+1 for each Swamp your opponents control.",
  static: [
    {
      affects: { scope: "self" },
      protection: { colors: ["B"] },
      text: "Protection from black",
    },
    {
      affects: { scope: "self" },
      grantPtPerCount: { filter: { subtype: "Swamp", controlledBy: "opponent" }, pt: [1, 1] },
      text: "This creature gets +1/+1 for each Swamp your opponents control.",
    },
  ],
});
