import { defineCard } from "../define.js";
import { equip } from "../helpers.js";

const HIT_TEXT = "Whenever equipped creature deals combat damage to a player, scry 1, then draw a card.";

export default defineCard({
  name: "Goggles of Night",
  manaCost: "{1}{U}",
  colors: ["U"],
  types: ["artifact"],
  subtypes: ["Equipment"],
  text: `${HIT_TEXT} (To scry 1, look at the top card of your library, then you may put that card on the bottom.)\nEquip {2}`,
  triggered: [
    {
      trigger: { on: "deals-combat-damage-to-player", who: "attached" },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "scry", amount: 1 },
          { kind: "draw", amount: 1 },
        ],
      },
      resolve: null,
      text: HIT_TEXT,
    },
  ],
  activated: [equip("{2}")],
});
