import { defineCard } from "../define.js";

// Mercadian Masques (MMQ). EDHREC rank 26937.
//
// Rulings:
//   [2004-10-04] The creatures are only prevented from untapping during the targeted player's next
//     untap step. They can still can untap during other player's untap steps.
//   [2008-08-01] No creature controlled by the player will untap during their next untap step.
//     This includes creatures which entered the battlefield after Misstep resolved.
//
// Icebreaker Kraken's `skip-next-untap`: the filter is read at that player's
// untap step, so a creature that entered since is held too (the 2008 ruling).

export default defineCard({
  name: "Misstep",
  manaCost: "{1}{U}",
  colors: ["U"],
  types: ["sorcery"],
  text: "Creatures target player controls don't untap during that player's next untap step.",
  targets: ["player"],
  effect: { kind: "skip-next-untap", filter: { type: "creature" }, who: 0 },
});
