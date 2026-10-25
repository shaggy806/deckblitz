import { defineCard } from "../define.js";
import { equip } from "../helpers.js";

// The granted trigger fires once per combat damage event — a trampler's
// blocker and player are one (rule 603.2c) — and a first striker's two
// combat damage steps are two.
const GRANTED_TEXT = "Whenever this creature deals combat damage, create a Blood token.";
const STATIC_TEXT = `Equipped creature gets +1/+0 and has "${GRANTED_TEXT}" (It's an artifact with "{1}, {T}, Discard a card, Sacrifice this token: Draw a card.")`;

export default defineCard({
  name: "Ceremonial Knife",
  manaCost: "{1}",
  colors: [],
  types: ["artifact"],
  subtypes: ["Equipment"],
  text: `${STATIC_TEXT}\nEquip {2} ({2}: Attach to target creature you control. Equip only as a sorcery.)`,
  static: [
    {
      affects: { scope: "attached" },
      grantPt: [1, 0],
      grantsTriggered: [
        {
          trigger: { on: "deals-damage", who: "self", combat: true },
          targets: [],
          effect: { kind: "create-token", token: "Blood Token", count: 1 },
          resolve: null,
          text: GRANTED_TEXT,
        },
      ],
      text: STATIC_TEXT,
    },
  ],
  activated: [equip("{2}")],
});
