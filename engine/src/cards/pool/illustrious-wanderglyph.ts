import { defineCard } from "../define.js";

const ANTHEM = "Other artifact creatures you control get +2/+2 as long as you have the city's blessing.";
const UPKEEP = "At the beginning of each upkeep, create a 1/1 colorless Gnome artifact creature token.";

export default defineCard({
  name: "Illustrious Wanderglyph",
  manaCost: "{4}{W}",
  colors: ["W"],
  types: ["artifact", "creature"],
  subtypes: ["Golem"],
  power: 2,
  toughness: 2,
  keywords: ["ascend"],
  text: `Ascend (If you control ten or more permanents, you get the city's blessing for the rest of the game.)\n${ANTHEM}\n${UPKEEP}`,
  static: [
    {
      affects: { scope: "filter", filter: { types: ["artifact", "creature"], controlledBy: "you" }, excludeSelf: true },
      condition: { kind: "citys-blessing" },
      grantPt: [2, 2],
      text: ANTHEM,
    },
  ],
  triggered: [
    {
      trigger: { on: "step-begins", step: "upkeep", who: "any" },
      targets: [],
      effect: { kind: "create-token", token: "Gnome Token", count: 1 },
      resolve: null,
      text: UPKEEP,
    },
  ],
});
