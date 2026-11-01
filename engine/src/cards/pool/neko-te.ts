import { defineCard } from "../define.js";
import { equip } from "../helpers.js";

// EDHREC rank 19354.

const TAP_TEXT =
  "Whenever equipped creature deals damage to a creature, tap that creature. That creature doesn't untap during its controller's untap step for as long as this Equipment remains on the battlefield.";
const LIFE_TEXT = "Whenever equipped creature deals damage to a player, that player loses 1 life.";

export default defineCard({
  name: "Neko-Te",
  manaCost: "{3}",
  colors: [],
  types: ["artifact"],
  subtypes: ["Equipment"],
  text: `${TAP_TEXT}\n${LIFE_TEXT}\nEquip {2}`,
  triggered: [
    {
      trigger: { on: "deals-damage", who: "attached", to: "creature" },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "tap", target: "trigger-recipient" },
          { kind: "restrict", target: "trigger-recipient", restrictions: ["doesnt-untap"], duration: "while-source" },
        ],
      },
      resolve: null,
      text: TAP_TEXT,
    },
    {
      trigger: { on: "deals-damage", who: "attached", to: "player" },
      targets: [],
      effect: { kind: "lose-life", amount: 1, who: "trigger-player" },
      resolve: null,
      text: LIFE_TEXT,
    },
  ],
  activated: [equip("{2}")],
});
