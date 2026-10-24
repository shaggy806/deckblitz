import { defineCard } from "../define.js";
import { equip } from "../helpers.js";

// EDHREC rank 7524.
const FEAR_TEXT = "Equipped creature has fear. (It can't be blocked except by artifact creatures and/or black creatures.)";
const DRAW_TEXT = "Whenever equipped creature deals combat damage to a player, you may draw a card.";

export default defineCard({
  name: "Mask of Riddles",
  manaCost: "{U}{B}",
  colors: ["U", "B"],
  types: ["artifact"],
  subtypes: ["Equipment"],
  text: `${FEAR_TEXT}\n${DRAW_TEXT}\nEquip {2}`,
  static: [{ affects: { scope: "attached" }, grantKeywords: ["fear"], text: FEAR_TEXT }],
  triggered: [
    {
      trigger: { on: "deals-combat-damage-to-player", who: "attached" },
      targets: [],
      effect: { kind: "may", prompt: "Draw a card?", effect: { kind: "draw", amount: 1 } },
      resolve: null,
      text: DRAW_TEXT,
    },
  ],
  activated: [equip("{2}")],
});
