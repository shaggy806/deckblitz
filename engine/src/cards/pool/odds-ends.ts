import { defineCard } from "../define.js";

const FACES = ["Odds // Ends", "Odds", "Ends"];

export default defineCard({
  name: "Odds // Ends",
  manaCost: "{U}{R}{3}{R}{W}",
  colors: ["W", "U", "R"],
  types: ["instant"],
  text: "Flip a coin. If it comes up heads, counter target instant or sorcery spell. If it comes up tails, copy that spell and you may choose new targets for the copy.\n//\nTarget player sacrifices two attacking creatures of their choice.",
  faces: FACES,
  split: true,
});
