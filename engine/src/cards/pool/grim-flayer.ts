import { defineCard } from "../define.js";

const SURVEIL_TEXT = "Whenever this creature deals combat damage to a player, surveil 3.";
const DELIRIUM_TEXT =
  "Delirium — This creature gets +2/+2 as long as there are four or more card types among cards in your graveyard.";

export default defineCard({
  name: "Grim Flayer",
  manaCost: "{B}{G}",
  colors: ["B", "G"],
  types: ["creature"],
  subtypes: ["Human", "Warrior"],
  power: 2,
  toughness: 2,
  keywords: ["trample"],
  text: `Trample\n${SURVEIL_TEXT} (Look at the top three cards of your library, then put any number of them into your graveyard and the rest on top of your library in any order.)\n${DELIRIUM_TEXT}`,
  triggered: [
    {
      trigger: { on: "deals-combat-damage-to-player", who: "self" },
      targets: [],
      effect: { kind: "surveil", amount: 3 },
      resolve: null,
      text: SURVEIL_TEXT,
    },
  ],
  static: [
    {
      affects: { scope: "self" },
      condition: { kind: "delirium" },
      grantPt: [2, 2],
      text: DELIRIUM_TEXT,
    },
  ],
});
