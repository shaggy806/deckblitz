import { defineCard } from "../define.js";

export default defineCard({
  name: "Settle Beyond Reality",
  manaCost: "{4}{W}",
  colors: ["W"],
  types: ["sorcery"],
  text: "Choose one or both —\n• Exile target creature you don't control.\n• Exile target creature you control, then return it to the battlefield under its owner's control.",
  castModal: {
    minModes: 1,
    maxModes: 2,
    modes: [
      {
        text: "Exile target creature you don't control.",
        targets: ["creature-an-opponent-controls"],
        effect: { kind: "exile", target: 0 },
      },
      {
        text: "Exile target creature you control, then return it to the battlefield under its owner's control.",
        targets: ["creature-you-control"],
        effect: { kind: "flicker", target: 0 },
      },
    ],
  },
});
