import { defineCard } from "../define.js";
import { myriad } from "../helpers.js";

// EDHREC rank 12249.
//
// Mass of Mysteries' grant of myriad (the `myriad()` triggered ability) to a
// target creature you control; overloaded, every creature you control as it
// resolves gains it (`grant-triggered-all`, the set fixed then — rule 611.2c)
// and nothing is targeted.

export default defineCard({
  name: "Corporeal Projection",
  manaCost: "{U}{R}",
  colors: ["U", "R"],
  types: ["sorcery"],
  text: "Target creature you control gains myriad until end of turn. (Whenever it attacks, for each opponent other than defending player, you may create a token copy that's tapped and attacking that player or a planeswalker they control. Exile the tokens at end of combat.)\nOverload {3}{U}{U}{R}{R} (You may cast this spell for its overload cost. If you do, change \"target\" in its text to \"each.\")",
  targets: ["creature-you-control"],
  effect: { kind: "grant-triggered", target: 0, ability: myriad(), duration: "end-of-turn" },
  overload: {
    cost: "{3}{U}{U}{R}{R}",
    effect: {
      kind: "grant-triggered-all",
      filter: { type: "creature", controlledBy: "you" },
      ability: myriad(),
      duration: "end-of-turn",
    },
  },
});
