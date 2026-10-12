import { defineCard } from "../define.js";

export default defineCard({
  name: "Swirling Torrent",
  manaCost: "{5}{U}",
  colors: ["U"],
  types: ["sorcery"],
  text: "Choose one or both —\n• Put target creature on top of its owner's library.\n• Return target creature to its owner's hand.",
  castModal: {
    minModes: 1,
    maxModes: 2,
    modes: [
      {
        text: "Put target creature on top of its owner's library.",
        targets: ["creature"],
        effect: { kind: "put-on-library", target: 0, position: "top" },
      },
      {
        text: "Return target creature to its owner's hand.",
        targets: ["creature"],
        effect: { kind: "return-to-hand", target: 0 },
      },
    ],
  },
});
