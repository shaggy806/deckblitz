import { defineCard } from "../define.js";

export default defineCard({
  name: "Misery Charm",
  manaCost: "{B}",
  colors: ["B"],
  types: ["instant"],
  text:
    "Choose one —\n" +
    "• Destroy target Cleric.\n" +
    "• Return target Cleric card from your graveyard to your hand.\n" +
    "• Target player loses 2 life.",
  castModal: {
    minModes: 1,
    maxModes: 1,
    modes: [
      {
        text: "Destroy target Cleric.",
        targets: [{ kind: "permanent", filter: { subtype: "Cleric" } }],
        effect: { kind: "destroy", target: 0 },
      },
      {
        text: "Return target Cleric card from your graveyard to your hand.",
        targets: [{ kind: "card-in-graveyard", whose: "you", filter: { subtype: "Cleric" } }],
        effect: { kind: "return-to-hand", target: 0, from: "graveyard" },
      },
      {
        text: "Target player loses 2 life.",
        targets: ["player"],
        effect: { kind: "lose-life", amount: 2, target: 0 },
      },
    ],
  },
});
