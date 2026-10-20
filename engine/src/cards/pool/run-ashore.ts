import { defineCard } from "../define.js";

// Kaldheim (KHM). EDHREC rank 25742. With both modes, they happen in the
// listed order (the ruling); the owner chooses top or bottom.
export default defineCard({
  name: "Run Ashore",
  manaCost: "{4}{U}{U}",
  colors: ["U"],
  types: ["instant"],
  text: "Choose one or both —\n• The owner of target nonland permanent puts it on their choice of the top or bottom of their library.\n• Return target nonland permanent to its owner's hand.",
  castModal: {
    minModes: 1,
    maxModes: 2,
    modes: [
      {
        text: "The owner of target nonland permanent puts it on their choice of the top or bottom of their library.",
        targets: ["nonland-permanent"],
        effect: { kind: "put-on-library", target: 0, position: { ownerChooses: ["top", "bottom"] } },
      },
      {
        text: "Return target nonland permanent to its owner's hand.",
        targets: ["nonland-permanent"],
        effect: { kind: "return-to-hand", target: 0 },
      },
    ],
  },
});
