import { defineCard } from "../define.js";

// EDHREC rank 30208.
//
// Rulings:
//   [2004-10-04] The token creature enters under your control regardless of who controlled the
//     targeted creature.
//   [2008-10-01] The Spirit token has the power and toughness of the attacking creature as it last
//     existed on the battlefield.
//
// The token's P/T is set as it's made (`basePt`), from `powerOf`/`toughnessOf`
// slot 0 — read as the destroyed creature last existed (rule 608.2h).

export default defineCard({
  name: "Broken Visage",
  manaCost: "{4}{B}",
  colors: ["B"],
  types: ["instant"],
  text: "Destroy target nonartifact attacking creature. It can't be regenerated. Create a black Spirit creature token. Its power is equal to that creature's power and its toughness is equal to that creature's toughness. Sacrifice the token at the beginning of the next end step.",
  targets: [{ kind: "permanent", filter: { type: "creature", notTypes: ["artifact"], attacking: true } }],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "destroy", target: 0, cantBeRegenerated: true },
      {
        kind: "create-token",
        token: "X/X Spirit Token (Black)",
        count: 1,
        basePt: { power: { powerOf: 0 }, toughness: { toughnessOf: 0 } },
        sacrificeAtEndStep: true,
      },
    ],
  },
});
