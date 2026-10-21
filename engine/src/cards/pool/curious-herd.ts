import { defineCard } from "../define.js";

export default defineCard({
  name: "Curious Herd",
  manaCost: "{3}{G}",
  colors: ["G"],
  types: ["instant"],
  text: "Choose target opponent. You create X 3/3 green Beast creature tokens, where X is the number of artifacts that player controls.",
  targets: ["opponent"],
  effect: {
    kind: "create-token",
    token: "3/3 Beast Token",
    count: { countOf: { type: "artifact", controlledBy: "you" }, forTarget: 0 },
  },
});
