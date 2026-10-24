import { defineCard } from "../define.js";

// EDHREC rank 7343. The Forests are counted as it resolves; the bonus is
// fixed then (rule 608.2h), not a live count.
export default defineCard({
  name: "Primal Bellow",
  manaCost: "{G}",
  colors: ["G"],
  types: ["instant"],
  text: "Target creature gets +1/+1 until end of turn for each Forest you control.",
  targets: ["creature"],
  effect: {
    kind: "modify-pt",
    target: 0,
    power: { countOf: { subtype: "Forest", controlledBy: "you" } },
    toughness: { countOf: { subtype: "Forest", controlledBy: "you" } },
    duration: "end-of-turn",
  },
});
