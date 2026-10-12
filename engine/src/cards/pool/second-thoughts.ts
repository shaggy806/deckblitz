import { defineCard } from "../define.js";

export default defineCard({
  name: "Second Thoughts",
  manaCost: "{4}{W}",
  colors: ["W"],
  types: ["instant"],
  text: "Exile target attacking creature.\nDraw a card.",
  targets: [{ kind: "permanent", filter: { attacking: true, type: "creature" } }],
  effect: { kind: "sequence", effects: [{ kind: "exile", target: 0 }, { kind: "draw", amount: 1 }] },
});
