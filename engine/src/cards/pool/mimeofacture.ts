import { defineCard } from "../define.js";

// EDHREC rank 27991. "That player" is the target's controller; the find has
// the target's name as this resolves (rule 201.2a). Each replicate copy may
// choose a new target (rule 702.56a).

export default defineCard({
  name: "Mimeofacture",
  manaCost: "{3}{U}",
  colors: ["U"],
  types: ["sorcery"],
  kicker: { cost: "{3}{U}", keyword: "replicate", multi: true },
  text: "Replicate {3}{U} (When you cast this spell, copy it for each time you paid its replicate cost. You may choose new targets for the copies.)\nChoose target permanent an opponent controls. Search that player's library for a card with the same name and put it onto the battlefield under your control. Then that player shuffles.",
  targets: [{ kind: "permanent", whose: "opponent", filter: {} }],
  effect: {
    kind: "search-library",
    whose: { controllerOfTarget: 0 },
    filter: { sameNameAsTarget: 0 },
    destination: "battlefield",
    min: 0,
    max: 1,
  },
});
