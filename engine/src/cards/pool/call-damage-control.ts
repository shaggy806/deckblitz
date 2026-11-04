import { defineCard } from "../define.js";

// The modes only pick the targets; one instruction returns them, all at once
// (`castModal.simultaneous`).
const graveyardCard = (type: "artifact" | "creature" | "enchantment" | "land") =>
  ({ kind: "card-in-graveyard", whose: "you", filter: { type } }) as const;

const returnIt = { kind: "return-to-hand", target: 0, from: "graveyard" } as const;

export default defineCard({
  name: "Call Damage Control",
  manaCost: "{1}{G}",
  colors: ["G"],
  types: ["sorcery"],
  text:
    "Choose up to two. Return those cards from your graveyard to your hand.\n" +
    "• Target artifact card.\n• Target creature card.\n• Target enchantment card.\n• Target land card.",
  castModal: {
    minModes: 0,
    maxModes: 2,
    simultaneous: true,
    modes: [
      { text: "Target artifact card.", targets: [graveyardCard("artifact")], effect: returnIt },
      { text: "Target creature card.", targets: [graveyardCard("creature")], effect: returnIt },
      { text: "Target enchantment card.", targets: [graveyardCard("enchantment")], effect: returnIt },
      { text: "Target land card.", targets: [graveyardCard("land")], effect: returnIt },
    ],
  },
});
