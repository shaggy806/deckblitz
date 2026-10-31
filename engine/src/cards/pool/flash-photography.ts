import { defineCard } from "../define.js";

// "As though it had flash if it targets a permanent you control" (`flashIf`
// with `targets`): any permanent may be targeted at sorcery timing; at other
// times only one of the caster's own (rules 601.3b, 601.6), a flashback cast
// from the graveyard included.
export default defineCard({
  name: "Flash Photography",
  manaCost: "{2}{U}{U}",
  colors: ["U"],
  types: ["sorcery"],
  flashback: { cost: "{4}{U}{U}" },
  flashIf: { targets: { controlledBy: "you" } },
  text: "You may cast this spell as though it had flash if it targets a permanent you control.\nCreate a token that's a copy of target permanent.\nFlashback {4}{U}{U} (You may cast this card from your graveyard for its flashback cost. Then exile it.)",
  targets: ["permanent"],
  effect: { kind: "create-token-copy", of: 0, count: 1, who: "you" },
});
