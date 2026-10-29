import { defineCard } from "../define.js";

// EDHREC rank 27567.

export default defineCard({
  name: "Restrain",
  manaCost: "{2}{W}",
  colors: ["W"],
  types: ["instant"],
  text: "Prevent all combat damage that would be dealt by target attacking creature this turn.\nDraw a card.",
  targets: [{ kind: "permanent", filter: { attacking: true, type: "creature" } }],
  effect: {
    kind: "sequence",
    effects: [{ kind: "damage-rule", by: { target: 0 }, combat: true }, { kind: "draw", amount: 1 }],
  },
});
