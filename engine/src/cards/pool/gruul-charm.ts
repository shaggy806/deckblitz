import { defineCard } from "../define.js";

export default defineCard({
  name: "Gruul Charm",
  manaCost: "{R}{G}",
  colors: ["R", "G"],
  types: ["instant"],
  text:
    "Choose one —\n" +
    "• Creatures without flying can't block this turn.\n" +
    "• Gain control of all permanents you own.\n" +
    "• Gruul Charm deals 3 damage to each creature with flying.",
  castModal: {
    minModes: 1,
    maxModes: 1,
    modes: [
      {
        text: "Creatures without flying can't block this turn.",
        effect: { kind: "restrict", filter: { type: "creature", notKeyword: "flying" }, restrictions: ["cant-block"] },
      },
      {
        text: "Gain control of all permanents you own.",
        effect: { kind: "gain-control-all", filter: { ownedBy: "you" }, untilEndOfTurn: false },
      },
      {
        text: "Gruul Charm deals 3 damage to each creature with flying.",
        effect: { kind: "damage-all", amount: 3, filter: { type: "creature", keyword: "flying" } },
      },
    ],
  },
});
