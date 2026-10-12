import { defineCard } from "../define.js";

export default defineCard({
  name: "Silverstrike",
  manaCost: "{3}{W}",
  colors: ["W"],
  types: ["instant"],
  text: "Destroy target attacking creature. You gain 3 life.",
  targets: [{ kind: "permanent", filter: { attacking: true, type: "creature" } }],
  effect: {
    kind: "sequence",
    effects: [{ kind: "destroy", target: 0 }, { kind: "gain-life", amount: 3 }],
  },
});
