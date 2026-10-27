import { defineCard } from "../define.js";

// EDHREC rank 17934.
//
// Only creatures on the battlefield, by the name of the face that's up
// (`CardFilter.sameNameAsTarget`, rule 201.2a); hexproof doesn't save the
// untargeted namesakes.

export default defineCard({
  name: "Sever the Bloodline",
  manaCost: "{3}{B}",
  colors: ["B"],
  types: ["sorcery"],
  text: "Exile target creature and all other creatures with the same name as that creature.\nFlashback {5}{B}{B} (You may cast this card from your graveyard for its flashback cost. Then exile it.)",
  flashback: { cost: "{5}{B}{B}" },
  targets: ["creature"],
  effect: { kind: "exile-all", filter: { type: "creature", sameNameAsTarget: 0 } },
});
