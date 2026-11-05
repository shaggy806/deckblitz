import { defineCard } from "../define.js";

// EDHREC rank 24893.

export default defineCard({
  name: "Flameshot",
  manaCost: "{3}{R}",
  colors: ["R"],
  types: ["sorcery"],
  alternativeCost: { mana: "{0}", discard: { filter: { subtype: "Mountain" }, text: "a Mountain card" } },
  text: "You may discard a Mountain card rather than pay this spell's mana cost.\nFlameshot deals 3 damage divided as you choose among one, two, or three target creatures.",
  targets: [{ kind: "any-number", of: "creature", min: 1, max: 3 }],
  divided: { total: 3, slot: 0 },
  effect: { kind: "damage-divided", from: 0 },
});
