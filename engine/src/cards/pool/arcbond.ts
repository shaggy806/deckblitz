import { defineCard } from "../define.js";

const WATCH = "Whenever that creature is dealt damage this turn, it deals that much damage to each other creature and each player.";

export default defineCard({
  name: "Arcbond",
  manaCost: "{2}{R}",
  colors: ["R"],
  types: ["instant"],
  text: `Choose target creature. ${WATCH}`,
  targets: ["creature"],
  effect: {
    kind: "delayed-trigger",
    at: { whenever: { on: "dealt-damage", who: "self" }, watching: 0 },
    effect: {
      kind: "sequence",
      effects: [
        {
          kind: "damage-all",
          filter: { type: "creature" },
          amount: { triggerValue: true },
          from: "trigger-object",
          exceptSource: true,
        },
        { kind: "damage", who: "each-player", amount: { triggerValue: true }, from: "trigger-object" },
      ],
    },
    text: WATCH,
  },
});
