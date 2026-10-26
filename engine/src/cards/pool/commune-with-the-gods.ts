import { defineCard } from "../define.js";

export default defineCard({
  name: "Commune with the Gods",
  manaCost: "{1}{G}",
  colors: ["G"],
  types: ["sorcery"],
  text: "Reveal the top five cards of your library. You may put a creature or enchantment card from among them into your hand. Put the rest into your graveyard.",
  effect: {
    kind: "look-and-choose",
    zone: "library",
    count: 5,
    reveal: true,
    min: 0,
    max: 1,
    filter: { typesAnyOf: ["creature", "enchantment"] },
    destination: "hand",
    leftover: "graveyard",
  },
});
