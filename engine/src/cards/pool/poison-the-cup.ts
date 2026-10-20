import { defineCard } from "../define.js";

// EDHREC rank 11001. Kaldheim.
//
// "If this spell was foretold" — cast from exile for its foretell cost: the
// spell's own `castVia` (Monastery Raid's freerunning shape). With its target
// gone it doesn't resolve, so there's no scry (the ruling).

export default defineCard({
  name: "Poison the Cup",
  manaCost: "{1}{B}{B}",
  colors: ["B"],
  types: ["instant"],
  foretell: { cost: "{1}{B}" },
  text: "Destroy target creature. If this spell was foretold, scry 2.\nForetell {1}{B} (During your turn, you may pay {2} and exile this card from your hand face down. Cast it on a later turn for its foretell cost.)",
  targets: ["creature"],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "destroy", target: 0 },
      {
        kind: "conditional",
        condition: { kind: "source", filter: { castVia: "foretell" } },
        then: { kind: "scry", amount: 2 },
      },
    ],
  },
});
