import { defineCard } from "../define.js";

// EDHREC rank 9424.
export default defineCard({
  name: "Twist Reality",
  manaCost: "{1}{U}{U}",
  colors: ["U"],
  types: ["instant"],
  text: "Choose one —\n• Counter target spell.\n• Manifest dread. (Look at the top two cards of your library. Put one onto the battlefield face down as a 2/2 creature and the other into your graveyard. Turn it face up any time for its mana cost if it's a creature card.)",
  castModal: {
    minModes: 1,
    maxModes: 1,
    modes: [
      { text: "Counter target spell.", targets: ["spell"], effect: { kind: "counter", target: 0 } },
      { text: "Manifest dread.", targets: [], effect: { kind: "manifest-dread" } },
    ],
  },
});
