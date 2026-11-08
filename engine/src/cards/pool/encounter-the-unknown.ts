import { defineCard } from "../define.js";

export default defineCard({
  name: "Encounter the Unknown",
  manaCost: "{1}{R}{R}",
  colors: ["R"],
  types: ["instant"],
  text: "Choose one —\n• Come in Peace — Exile the top two cards of your library. Until the end of your next turn, you may play those cards.\n• Shoot to Kill — Encounter the Unknown deals 2 damage to each creature and each player.",
  castModal: {
    minModes: 1,
    maxModes: 1,
    modes: [
      {
        targets: [],
        effect: { kind: "impulse-exile", amount: 2, duration: "until-end-of-your-next-turn", play: true },
        text: "Come in Peace — Exile the top two cards of your library. Until the end of your next turn, you may play those cards.",
      },
      {
        text: "Shoot to Kill — Encounter the Unknown deals 2 damage to each creature and each player.",
        targets: [],
        effect: {
          kind: "sequence",
          simultaneous: true,
          effects: [
            { kind: "damage-all", filter: { type: "creature" }, amount: 2 },
            { kind: "damage", amount: 2, who: "each-player" },
          ],
        },
      },
    ],
  },
});
