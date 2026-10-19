import { defineCard } from "../define.js";

// Ruling: with several tied for the greatest mana value, the target opponent
// chooses which to sacrifice as it resolves (Break Under Pressure's shape).
export default defineCard({
  name: "Riveteers Charm",
  manaCost: "{B}{R}{G}",
  colors: ["B", "R", "G"],
  types: ["instant"],
  text:
    "Choose one —\n" +
    "• Target opponent sacrifices a creature or planeswalker they control with the greatest mana value among creatures and planeswalkers they control.\n" +
    "• Exile the top three cards of your library. Until your next end step, you may play those cards.\n" +
    "• Exile target player's graveyard.",
  castModal: {
    minModes: 1,
    maxModes: 1,
    modes: [
      {
        text: "Target opponent sacrifices a creature or planeswalker they control with the greatest mana value among creatures and planeswalkers they control.",
        targets: ["opponent"],
        effect: {
          kind: "sacrifice",
          who: "target",
          filter: {
            typesAnyOf: ["creature", "planeswalker"],
            greatestAmongItsController: { of: "mana-value", among: { typesAnyOf: ["creature", "planeswalker"] } },
          },
          count: 1,
        },
      },
      {
        text: "Exile the top three cards of your library. Until your next end step, you may play those cards.",
        effect: { kind: "impulse-exile", amount: 3, duration: "your-next-end-step" },
      },
      {
        text: "Exile target player's graveyard.",
        targets: ["player"],
        effect: { kind: "exile-graveyard", target: 0 },
      },
    ],
  },
});
