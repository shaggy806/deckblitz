import { defineCard } from "../define.js";

// EDHREC rank 10521. The Lost Caverns of Ixalan Commander.
//
// Cackling Counterpart's copy, as a sorcery with flashback {3}{U}.

export default defineCard({
  name: "Self-Reflection",
  manaCost: "{4}{U}{U}",
  colors: ["U"],
  types: ["sorcery"],
  flashback: { cost: "{3}{U}" },
  text: "Create a token that's a copy of target creature you control.\nFlashback {3}{U} (You may cast this card from your graveyard for its flashback cost. Then exile it.)",
  targets: ["creature-you-control"],
  effect: { kind: "create-token-copy", of: 0, count: 1, who: "you" },
});
