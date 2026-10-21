import { defineCard } from "../define.js";

export default defineCard({
  name: "Relentless Pursuit",
  manaCost: "{2}{G}",
  colors: ["G"],
  types: ["sorcery"],
  text: "Reveal the top four cards of your library. You may put a creature card and/or a land card from among them into your hand. Put the rest into your graveyard.",
  effect: {
    kind: "look-and-choose",
    zone: "library",
    count: 4,
    reveal: true,
    min: 0,
    max: 1,
    filter: { type: "creature" },
    destination: "hand",
    secondPick: { filter: { type: "land" }, min: 0, max: 1, destination: "hand" },
    leftover: "graveyard",
  },
});
