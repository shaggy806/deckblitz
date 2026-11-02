import { defineCard } from "../define.js";

export default defineCard({
  name: "Burn Away",
  manaCost: "{4}{R}",
  colors: ["R"],
  types: ["instant"],
  text: "Burn Away deals 6 damage to target creature. When that creature dies this turn, exile its controller's graveyard.",
  targets: ["creature"],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "damage", amount: 6, target: 0 },
      {
        kind: "delayed-trigger",
        at: { leaves: 0, to: ["graveyard"], thisTurn: true },
        text: "When that creature dies this turn, exile its controller's graveyard.",
        effect: { kind: "as-player", who: "trigger-controller", effect: { kind: "exile-graveyard", target: "you" } },
      },
    ],
  },
});
