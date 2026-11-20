import { defineCard } from "../define.js";

// EDHREC rank 19791.
//
// A prevention shield of the equipped creature (rule 615.10): "prevent X of
// that damage", X counted as the damage would be dealt (`prevent: { count }`,
// from the Equipment's controller's side — Battletide Alchemist's ruling), of
// each source's damage on its own (Shield of the Realm's ruling), nothing
// when X is 0.
const PREVENT_TEXT =
  "If a source would deal damage to equipped creature, prevent X of that damage, where X is the number of creatures you control.";

export default defineCard({
  name: "Shield of the Avatar",
  manaCost: "{1}",
  colors: [],
  types: ["artifact"],
  subtypes: ["Equipment"],
  text: `${PREVENT_TEXT}\nEquip {2}`,
  static: [
    {
      affects: { scope: "self" },
      replacement: {
        event: "would-deal-damage",
        to: "attached",
        instead: { prevent: { count: { countOf: { type: "creature", controlledBy: "you" } } } },
      },
      text: PREVENT_TEXT,
    },
  ],
  activated: [
    {
      cost: { mana: "{2}", tap: false },
      targets: ["creature-you-control"],
      effect: { kind: "attach", target: 0 },
      resolve: null,
      text: "Equip {2}",
      sorcerySpeed: true,
    },
  ],
});
