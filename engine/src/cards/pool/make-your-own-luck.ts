import { defineCard } from "../define.js";

// The exiled card is the look's chosen card, `become-plotted`'s target 0;
// nothing chosen, nothing plotted.
export default defineCard({
  name: "Make Your Own Luck",
  manaCost: "{3}{G}{U}",
  colors: ["U", "G"],
  types: ["sorcery"],
  text: "Look at the top three cards of your library. You may exile a nonland card from among them. If you do, it becomes plotted. Put the rest into your hand. (You may cast it as a sorcery on a later turn without paying its mana cost.)",
  effect: {
    kind: "look-and-choose",
    zone: "library",
    count: 3,
    min: 0,
    max: 1,
    destination: "exile",
    leftover: "hand",
    filter: { notTypes: ["land"] },
    then: { kind: "become-plotted", target: 0 },
  },
});
