import { defineCard } from "../define.js";

const LORD = "Other Merfolk you control get +1/+1.";
const ATTACK = "Whenever one or more Merfolk you control attack a player, draw a card.";

export default defineCard({
  name: "Attuma, Atlantean Warlord",
  manaCost: "{2}{U}{U}",
  colors: ["U"],
  types: ["creature"],
  supertypes: ["legendary"],
  subtypes: ["Merfolk", "Warrior", "Villain"],
  power: 3,
  toughness: 4,
  text: `${LORD}\n${ATTACK}`,
  static: [
    {
      affects: { scope: "filter", filter: { type: "creature", subtype: "Merfolk", controlledBy: "you" }, excludeSelf: true },
      grantPt: [1, 1],
      text: LORD,
    },
  ],
  triggered: [
    {
      trigger: { on: "attacks-player", who: "you", defender: "any", filter: { subtype: "Merfolk" } },
      targets: [],
      effect: { kind: "draw", amount: 1 },
      resolve: null,
      text: ATTACK,
    },
  ],
});
