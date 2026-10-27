import { defineCard } from "../define.js";

// "Its controller creates": `create-token-copy` with no `who` puts each copy
// under the copied token's own controller (rule 111.11), and `{ each }` is a
// copy of every creature token on the battlefield, read as this resolves.

export default defineCard({
  name: "Parallel Evolution",
  manaCost: "{3}{G}{G}",
  colors: ["G"],
  types: ["sorcery"],
  flashback: { cost: "{4}{G}{G}{G}" },
  text: "For each creature token on the battlefield, its controller creates a token that's a copy of that creature.\nFlashback {4}{G}{G}{G} (You may cast this card from your graveyard for its flashback cost. Then exile it.)",
  targets: [],
  effect: { kind: "create-token-copy", of: { each: { type: "creature", token: true } }, count: 1 },
});
