import { defineCard } from "../define.js";

// EDHREC rank 21043.
//
// Rulings:
//   [2019-05-03] You must sacrifice exactly one creature to cast this spell.
//   [2019-05-03] The last time that the game checks whether you have permission to cast a spell
//     is before costs are paid. If you sacrifice a creature with flash to cast Mutual Destruction
//     and then have no other permanents with flash, you'll legally finish casting Mutual
//     Destruction even though it no longer has flash.
//
// The conditional flash is `flashIf` (Crashing Tide), read as the cast begins
// (rule 601.3d), before the sacrifice is paid.
export default defineCard({
  name: "Mutual Destruction",
  manaCost: "{B}",
  colors: ["B"],
  types: ["sorcery"],
  flashIf: { condition: { kind: "controls", filter: { keyword: "flash" }, atLeast: 1 } },
  text: "This spell has flash as long as you control a permanent with flash.\nAs an additional cost to cast this spell, sacrifice a creature.\nDestroy target creature.",
  targets: ["creature"],
  effect: { kind: "destroy", target: 0 },
  additionalCost: { sacrifice: { type: "creature" } },
});
