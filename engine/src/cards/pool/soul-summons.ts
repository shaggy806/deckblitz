import { defineCard } from "../define.js";

export default defineCard({
  name: "Soul Summons",
  manaCost: "{1}{W}",
  colors: ["W"],
  types: ["sorcery"],
  text: "Manifest the top card of your library. (Put it onto the battlefield face down as a 2/2 creature. Turn it face up any time for its mana cost if it's a creature card.)",
  effect: { kind: "manifest", who: "you" },
});
