import { defineCard } from "../define.js";

export default defineCard({
  name: "Bright Reprisal",
  manaCost: "{4}{W}",
  colors: ["W"],
  types: ["instant"],
  text: "Destroy target attacking creature.\nDraw a card.",
  targets: [{ kind: "permanent", filter: { attacking: true, type: "creature" } }],
  effect: { kind: "sequence", effects: [{ kind: "destroy", target: 0 }, { kind: "draw", amount: 1 }] },
});
