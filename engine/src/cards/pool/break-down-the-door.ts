import { defineCard } from "../define.js";

// EDHREC rank 10081.
export default defineCard({
  name: "Break Down the Door",
  manaCost: "{2}{G}",
  colors: ["G"],
  types: ["instant"],
  text: "Choose one —\n• Exile target artifact.\n• Exile target enchantment.\n• Manifest dread. (Look at the top two cards of your library. Put one onto the battlefield face down as a 2/2 creature and the other into your graveyard. Turn it face up any time for its mana cost if it's a creature card.)",
  castModal: {
    minModes: 1,
    maxModes: 1,
    modes: [
      { text: "Exile target artifact.", targets: ["artifact"], effect: { kind: "exile", target: 0 } },
      { text: "Exile target enchantment.", targets: ["enchantment"], effect: { kind: "exile", target: 0 } },
      { text: "Manifest dread.", targets: [], effect: { kind: "manifest-dread" } },
    ],
  },
});
