import { defineCard } from "../define.js";

// EDHREC rank 19321.

export default defineCard({
  name: "Spectral Shift",
  manaCost: "{1}{U}",
  colors: ["U"],
  types: ["instant"],
  kicker: { cost: "{2}", keyword: "entwine" },
  text: "Choose one —\n• Change the text of target spell or permanent by replacing all instances of one basic land type with another. (This effect lasts indefinitely.)\n• Change the text of target spell or permanent by replacing all instances of one color word with another. (This effect lasts indefinitely.)\nEntwine {2} (Choose both if you pay the entwine cost.)",
  castModal: {
    minModes: 1,
    maxModes: 1,
    modes: [
      {
        text: "Change the text of target spell or permanent by replacing all instances of one basic land type with another.",
        targets: [{ kind: "spell-or-permanent" }],
        effect: { kind: "change-text", target: 0, words: "land-type", duration: "permanent" },
      },
      {
        text: "Change the text of target spell or permanent by replacing all instances of one color word with another.",
        targets: [{ kind: "spell-or-permanent" }],
        effect: { kind: "change-text", target: 0, words: "color", duration: "permanent" },
      },
    ],
    kickedModes: 2,
  },
});
