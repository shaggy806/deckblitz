import { defineCard } from "../define.js";

// EDHREC rank 26839. Alliances.

export default defineCard({
  name: "Feast or Famine",
  manaCost: "{3}{B}",
  colors: ["B"],
  types: ["instant"],
  text: "Choose one —\n• Create a 2/2 black Zombie creature token.\n• Destroy target nonartifact, nonblack creature. It can't be regenerated.",
  castModal: {
    minModes: 1,
    maxModes: 1,
    modes: [
      { text: "Create a 2/2 black Zombie creature token.", effect: { kind: "create-token", token: "Zombie Token", count: 1 } },
      {
        text: "Destroy target nonartifact, nonblack creature. It can't be regenerated.",
        targets: [{ kind: "permanent", filter: { type: "creature", notTypes: ["artifact"], notColors: ["B"] } }],
        effect: { kind: "destroy", target: 0, cantBeRegenerated: true },
      },
    ],
  },
});
