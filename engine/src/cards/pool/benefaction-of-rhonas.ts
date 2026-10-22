import { defineCard } from "../define.js";

export default defineCard({
  name: "Benefaction of Rhonas",
  manaCost: "{2}{G}",
  colors: ["G"],
  types: ["sorcery"],
  text: "Reveal the top five cards of your library. You may put a creature card and/or an enchantment card from among them into your hand. Put the rest into your graveyard.",
  effect: {
    kind: "look-and-choose",
    zone: "library",
    count: 5,
    reveal: true,
    min: 0,
    max: 1,
    filter: { type: "creature" },
    destination: "hand",
    secondPick: { filter: { type: "enchantment" }, min: 0, max: 1, destination: "hand" },
    leftover: "graveyard",
  },
});
