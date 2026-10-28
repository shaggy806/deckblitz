import { defineCard } from "../define.js";

const FACES = ["Failure // Comply", "Failure", "Comply"];

export default defineCard({
  name: "Failure // Comply",
  manaCost: "{1}{U}{W}",
  colors: ["W", "U"],
  types: ["instant", "sorcery"],
  text: "Return target spell to its owner's hand.\n//\nAftermath (Cast this spell only from your graveyard. Then exile it.)\nChoose a card name. Until your next turn, your opponents can't cast spells with the chosen name.",
  faces: FACES,
  split: true,
});
