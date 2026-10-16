import { defineCard } from "../define.js";

// EDHREC rank 24330. The Deserts are counted as the spell resolves (rule
// 608.2h), the additional -1/-1 per Desert fixed then.
const DESERTS = { countOf: { subtype: "Desert", controlledBy: "you" } } as const;

export default defineCard({
  name: "Desert's Due",
  manaCost: "{1}{B}",
  colors: ["B"],
  types: ["instant"],
  text: "Target creature gets -2/-2 until end of turn. It gets an additional -1/-1 until end of turn for each Desert you control.",
  targets: ["creature"],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "modify-pt", target: 0, power: -2, toughness: -2, duration: "end-of-turn" },
      {
        kind: "modify-pt",
        target: 0,
        power: { product: [DESERTS, -1] },
        toughness: { product: [DESERTS, -1] },
        duration: "end-of-turn",
      },
    ],
  },
});
