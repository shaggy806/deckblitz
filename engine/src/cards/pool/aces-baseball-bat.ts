import { defineCard } from "../define.js";

// "Must be blocked by a Dalek if able": only one Dalek has to block it (the
// ruling — `mustBeBlockedBy` without `all`).
const ATTACKING = "As long as equipped creature is attacking, it has first strike and must be blocked by a Dalek if able.";

export default defineCard({
  name: "Ace's Baseball Bat",
  manaCost: "{2}",
  colors: [],
  supertypes: ["legendary"],
  types: ["artifact"],
  subtypes: ["Equipment"],
  text: `Equipped creature gets +3/+0.\n${ATTACKING}\nEquip legendary creature {1}\nEquip {3}`,
  activated: [
    {
      cost: { mana: "{1}", tap: false },
      targets: [{ kind: "permanent", whose: "you", filter: { type: "creature", supertype: "legendary" } }],
      effect: { kind: "attach", target: 0 },
      resolve: null,
      text: "Equip legendary creature {1}",
      sorcerySpeed: true,
    },
    {
      cost: { mana: "{3}", tap: false },
      targets: ["creature-you-control"],
      effect: { kind: "attach", target: 0 },
      resolve: null,
      text: "Equip {3}",
      sorcerySpeed: true,
    },
  ],
  static: [
    { affects: { scope: "attached" }, grantPt: [3, 0], text: "Equipped creature gets +3/+0." },
    {
      affects: { scope: "filter", filter: { hostOfSource: true, attacking: true } },
      grantKeywords: ["first-strike"],
      mustBeBlockedBy: { by: { type: "creature", subtype: "Dalek" } },
      text: ATTACKING,
    },
  ],
});
