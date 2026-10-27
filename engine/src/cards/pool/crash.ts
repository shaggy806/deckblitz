import { defineCard } from "../define.js";

// Mercadian Masques (MMQ). EDHREC rank 24281.
//
// "You may sacrifice a Mountain rather than pay this spell's mana cost" is
// an alternative cost (rule 118.9): `alternativeCost.sacrifice`, the
// Mountain chosen as the cost is paid (601.2h).

export default defineCard({
  name: "Crash",
  manaCost: "{2}{R}",
  colors: ["R"],
  types: ["instant"],
  text: "You may sacrifice a Mountain rather than pay this spell's mana cost.\nDestroy target artifact.",
  alternativeCost: { mana: "{0}", sacrifice: { filter: { type: "land", subtype: "Mountain" }, text: "a Mountain" } },
  targets: ["artifact"],
  effect: { kind: "destroy", target: 0 },
});
