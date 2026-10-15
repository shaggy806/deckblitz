import { defineCard } from "../define.js";
import { equip } from "../helpers.js";

// EDHREC rank 24329.
// The granted trigger belongs to the equipped creature, so "this creature"
// is its `source` and "another target attacking creature" leaves it out
// (Restless Ridgeline's target).

const GRANTED_TEXT = "Whenever this creature attacks, another target attacking creature gains indestructible until end of turn.";
const STATIC_TEXT = `Equipped creature gets +1/+2 and has "${GRANTED_TEXT}"`;

export default defineCard({
  name: "Iconic Shield",
  manaCost: "{W}",
  colors: ["W"],
  types: ["artifact"],
  subtypes: ["Equipment"],
  text: `${STATIC_TEXT} (Damage and effects that say "destroy" don't destroy it.)\nEquip {3} ({3}: Attach to target creature you control. Equip only as a sorcery.)`,
  static: [
    {
      affects: { scope: "attached" },
      grantPt: [1, 2],
      grantsTriggered: [
        {
          trigger: { on: "attacks", who: "self" },
          targets: [{ kind: "other", of: { kind: "permanent", filter: { type: "creature", attacking: true } } }],
          effect: { kind: "grant-keyword", target: 0, keyword: "indestructible", duration: "end-of-turn" },
          resolve: null,
          text: GRANTED_TEXT,
        },
      ],
      text: STATIC_TEXT,
    },
  ],
  activated: [equip("{3}")],
});
