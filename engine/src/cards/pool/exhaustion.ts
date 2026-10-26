import { defineCard } from "../define.js";

// EDHREC rank 17686.
//
// Rulings:
//   [2004-10-04] The creatures and lands are only prevented from untapping during the targeted
//     player’s next untap step. They can still can untap during other player’s untap steps.
//   [2009-10-01] No creatures or lands controlled by the player will untap during their next untap
//     step. This includes those which entered the battlefield after Exhaustion resolved.
//
// `skip-next-untap` reads the filter during that player's next untap step, so
// a creature or land that came under their control since is held too (the
// second ruling) — Icebreaker Kraken's shape.

export default defineCard({
  name: "Exhaustion",
  manaCost: "{2}{U}",
  colors: ["U"],
  types: ["sorcery"],
  text: "Creatures and lands target opponent controls don't untap during their next untap step.",
  targets: ["opponent"],
  effect: { kind: "skip-next-untap", filter: { typesAnyOf: ["creature", "land"] }, who: 0 },
});
