import { defineCard } from "../define.js";

export default defineCard({
  name: "Ethereal Ambush",
  manaCost: "{3}{G}{U}",
  colors: ["U", "G"],
  types: ["instant"],
  text: "Manifest the top two cards of your library. (To manifest a card, put it onto the battlefield face down as a 2/2 creature. Turn it face up any time for its mana cost if it's a creature card.)",
  targets: [],
  effect: { kind: "manifest", who: "you", count: 2 },
});
