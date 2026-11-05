import { defineCard } from "../define.js";

/** The colorless artifact token named Land Mine — Goblin Kaboomist's. */

const TEXT = "{R}, Sacrifice this token: This token deals 2 damage to target attacking creature without flying.";

export default defineCard({
  name: "Land Mine Token",
  art: "30093c6e-505e-4902-b535-707e364059b4",
  colors: [],
  types: ["artifact"],
  text: TEXT,
  activated: [
    {
      cost: { mana: "{R}", tap: false, sacrifice: "self" },
      targets: [{ kind: "permanent", filter: { type: "creature", attacking: true, notKeyword: "flying" } }],
      effect: { kind: "damage", amount: 2, target: 0 },
      resolve: null,
      text: TEXT,
    },
  ],
});
