import { defineCard } from "../define.js";

const FACES = ["Hustle // Bustle", "Hustle", "Bustle"];

export default defineCard({
  name: "Hustle // Bustle",
  manaCost: "{U/R}{4}{R/G}{R/G}",
  colors: ["U", "R", "G"],
  types: ["instant", "sorcery"],
  text:
    "Target creature attacks or blocks this turn if able.\n//\n" +
    "Creatures you control get +2/+2 and gain trample until end of turn. You may turn a creature you control face up.",
  faces: FACES,
  split: true,
});
