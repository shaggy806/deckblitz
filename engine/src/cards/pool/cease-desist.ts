import { defineCard } from "../define.js";

const FACES = ["Cease // Desist", "Cease", "Desist"];
const CEASE_TEXT =
  "Exile up to two target cards from a single graveyard. Target player gains 2 life and draws a card.";
const DESIST_TEXT = "Destroy all artifacts and enchantments.";

export default defineCard({
  name: "Cease // Desist",
  manaCost: "{1}{B/G}{4}{G/W}{G/W}",
  colors: ["W", "B", "G"],
  types: ["instant", "sorcery"],
  text: `${CEASE_TEXT}\n//\n${DESIST_TEXT}`,
  faces: FACES,
  split: true,
});
