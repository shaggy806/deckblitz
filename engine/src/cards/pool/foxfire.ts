import { defineCard } from "../define.js";

// EDHREC rank 25867.

export default defineCard({
  name: "Foxfire",
  manaCost: "{2}{G}",
  colors: ["G"],
  types: ["instant"],
  text: "Untap target attacking creature. Prevent all combat damage that would be dealt to and dealt by that creature this turn.\nDraw a card at the beginning of the next turn's upkeep.",
  targets: [{ kind: "permanent", filter: { attacking: true, type: "creature" } }],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "untap", target: 0 },
      { kind: "damage-rule", to: { target: 0 }, combat: true },
      { kind: "damage-rule", by: { target: 0 }, combat: true },
      {
        kind: "delayed-trigger",
        at: { step: "upkeep" },
        effect: { kind: "draw", amount: 1 },
        text: "Draw a card.",
      },
    ],
  },
});
