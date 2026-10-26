import type { CardFilter } from "../../filter.js";
import { defineCard } from "../define.js";

// Urza's Destiny. EDHREC rank 27289. Last-Ditch Effort's shape: the Mountains
// are chosen and sacrificed as it resolves, zero of them allowed (the rulings).
//
// Rulings:
//   [2004-10-04] You can sacrifice zero mountains to deal zero damage.
//   [2004-10-04] You sacrifice the mountains during resolution.
const MOUNTAIN: CardFilter = { subtype: "Mountain", controlledBy: "you" };

export default defineCard({
  name: "Landslide",
  manaCost: "{R}",
  colors: ["R"],
  types: ["sorcery"],
  text: "Sacrifice any number of Mountains. Landslide deals that much damage to target player or planeswalker.",
  targets: ["player-or-planeswalker"],
  effect: {
    kind: "sequence",
    effects: [
      {
        kind: "choose-permanents",
        filter: MOUNTAIN,
        min: 0,
        upTo: { countOf: MOUNTAIN },
        then: { kind: "sacrifice-target", target: 0 },
        prompt: "Sacrifice any number of Mountains",
      },
      { kind: "damage", amount: { thisWay: "sacrificed" }, target: 0 },
    ],
  },
});
