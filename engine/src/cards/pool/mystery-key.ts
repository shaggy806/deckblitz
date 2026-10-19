import { defineCard } from "../define.js";
import { equip } from "../helpers.js";

// EDHREC rank 17330.

const TRIGGER_TEXT =
  "When equipped creature deals combat damage to a player, sacrifice this Equipment. If you do, draw three cards.";

export default defineCard({
  name: "Mystery Key",
  manaCost: "{1}{U}",
  colors: ["U"],
  types: ["artifact"],
  subtypes: ["Equipment"],
  text: `${TRIGGER_TEXT}\nEquip {1}`,
  triggered: [
    {
      trigger: { on: "deals-combat-damage-to-player", who: "attached" },
      targets: [],
      // "If you do": no cards unless the Key is actually sacrificed — not
      // once it has left the battlefield in response.
      effect: { kind: "sacrifice-source", then: { kind: "draw", amount: 3 } },
      resolve: null,
      text: TRIGGER_TEXT,
    },
  ],
  activated: [equip("{1}")],
});
