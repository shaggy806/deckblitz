import { defineCard } from "../define.js";
import { equip } from "../helpers.js";

// EDHREC rank 17509.
//
// The granted ability is the equipped creature's own, so "blocking it" reads
// that creature (`blockingRelation`, Flowstone Salamander's).
const GRANT_TEXT = 'Equipped creature has "{1}: This creature deals 1 damage to target creature that\'s blocking it."';

export default defineCard({
  name: "Arc Spitter",
  manaCost: "{1}",
  colors: [],
  types: ["artifact"],
  subtypes: ["Equipment"],
  text: `${GRANT_TEXT}\nEquip {1} ({1}: Attach to target creature you control. Equip only as a sorcery.)`,
  static: [
    {
      affects: { scope: "attached" },
      grantsActivated: [
        {
          cost: { mana: "{1}", tap: false },
          targets: [{ kind: "permanent", filter: { type: "creature", blockingRelation: { relation: "blocking" } } }],
          effect: { kind: "damage", amount: 1, target: 0 },
          resolve: null,
          text: "{1}: This creature deals 1 damage to target creature that's blocking it.",
        },
      ],
      text: GRANT_TEXT,
    },
  ],
  activated: [equip("{1}")],
});
