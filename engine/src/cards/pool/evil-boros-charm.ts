import { defineCard } from "../define.js";

// Playtest card (Mystery Booster 2). "Unblocked attacking creatures" are
// every player's, as they are when it resolves (rule 509.1h: none are
// unblocked before blockers are declared).

export default defineCard({
  name: "Evil Boros Charm",
  manaCost: "{B/R}{W/B}",
  colors: ["W", "B", "R"],
  types: ["instant"],
  text:
    "Choose one —\n" +
    "• Evil Boros Charm deals 2 damage to any target and you gain 2 life.\n" +
    "• Unblocked attacking creatures get +1/+0 until end of turn.\n" +
    "• Create a 1/1 colorless Spirit creature token with lifelink and haste.",
  castModal: {
    minModes: 1,
    maxModes: 1,
    modes: [
      {
        text: "Evil Boros Charm deals 2 damage to any target and you gain 2 life.",
        targets: ["any-target"],
        effect: {
          kind: "sequence",
          effects: [
            { kind: "damage", amount: 2, target: 0 },
            { kind: "gain-life", amount: 2 },
          ],
        },
      },
      {
        text: "Unblocked attacking creatures get +1/+0 until end of turn.",
        effect: {
          kind: "modify-pt-all",
          filter: { type: "creature", unblocked: true },
          power: 1,
          toughness: 0,
          duration: "end-of-turn",
        },
      },
      {
        text: "Create a 1/1 colorless Spirit creature token with lifelink and haste.",
        effect: { kind: "create-token", token: "Spirit Token (Colorless, Lifelink, Haste)", count: 1 },
      },
    ],
  },
});
