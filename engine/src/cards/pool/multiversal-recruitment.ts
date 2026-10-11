import { defineCard } from "../define.js";

// EDHREC rank 9865.
//
// Not being legendary is part of what the token copies (rule 707.9b).
export default defineCard({
  name: "Multiversal Recruitment",
  manaCost: "{3}{U}",
  colors: ["U"],
  types: ["sorcery"],
  flashback: { cost: "{5}{U}{U}" },
  text:
    "Create a token that's a copy of target creature you control, except it isn't legendary.\n" +
    "Flashback {5}{U}{U} (You may cast this card from your graveyard for its flashback cost. Then exile it.)",
  targets: ["creature-you-control"],
  effect: { kind: "create-token-copy", of: 0, count: 1, who: "you", notLegendary: true },
});
