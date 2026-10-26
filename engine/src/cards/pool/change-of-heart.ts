import { defineCard } from "../define.js";

// EDHREC rank 25736.
//
// Rulings:
//   [2004-10-04] Change of Heart will not remove an already attacking creature from combat. It
//     must be cast before attackers are declared or it won’t have any noticeable effect on the
//     game.

export default defineCard({
  name: "Change of Heart",
  manaCost: "{W}",
  colors: ["W"],
  types: ["instant"],
  kicker: { cost: "{3}", keyword: "buyback" },
  text: "Buyback {3} (You may pay an additional {3} as you cast this spell. If you do, put this card into your hand as it resolves.)\nTarget creature can't attack this turn.",
  targets: ["creature"],
  effect: { kind: "restrict", target: 0, restrictions: ["cant-attack"] },
});
