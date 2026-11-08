import { defineCard } from "../define.js";
import { STORIED_TEXT } from "../helpers.js";

const EQUIP_TEXT =
  "As long as you have an enduring story, you may pay {0} rather than pay the equip cost of the first equip ability you activate each turn.";
const DRAW_TEXT =
  "Whenever another Dwarf or Equipment you control enters, draw a card. This ability triggers only once each turn.";

export default defineCard({
  name: "Kíli the Resourceful",
  manaCost: "{1}{W}",
  colors: ["W"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Dwarf", "Scout"],
  power: 1,
  toughness: 2,
  keywords: ["storied"],
  text: `${STORIED_TEXT}\n${EQUIP_TEXT}\n${DRAW_TEXT}`,
  static: [
    {
      // "The first equip ability you activate each turn": every one this turn
      // counts, those before Kíli arrived too (the journal's).
      affects: { scope: "self" },
      condition: { kind: "enduring-story" },
      alternativeEquipCost: { mana: "{0}", firstEachTurn: true },
      text: EQUIP_TEXT,
    },
  ],
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "you-control", filter: { subtypes: ["Dwarf", "Equipment"] }, otherOnly: true },
      targets: [],
      effect: { kind: "draw", amount: 1 },
      oncePerTurn: true,
      resolve: null,
      text: DRAW_TEXT,
    },
  ],
});
