import { defineCard } from "../define.js";

const FACES = ["Fast // Furious", "Fast", "Furious"];
const FAST_TEXT = "Discard a card, then draw two cards.";
const FURIOUS_TEXT = "Furious deals 3 damage to each creature without flying.";

export default defineCard({
  name: "Fast // Furious",
  manaCost: "{2}{R}{3}{R}{R}",
  colors: ["R"],
  types: ["instant", "sorcery"],
  text: `${FAST_TEXT}\n//\n${FURIOUS_TEXT}`,
  faces: FACES,
  split: true,
});
