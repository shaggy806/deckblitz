import { defineCard } from "../define.js";

// EDHREC rank 7803.
//
// Outlaws are the five creature types the reminder text lists (Vihaan,
// Goldwaker's static); permanents only, as the rulings say. The Mercenaries
// are the shared OTJ token.
const OUTLAWS = ["Assassin", "Mercenary", "Pirate", "Rogue", "Warlock"];
const HASTE_TEXT = "Other outlaws you control have haste.";
const ENTER_TEXT =
  'When this creature enters, create two 1/1 red Mercenary creature tokens with "{T}: Target creature you control gets +1/+0 until end of turn. Activate only as a sorcery."';

export default defineCard({
  name: "Hellspur Posse Boss",
  manaCost: "{2}{R}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Lizard", "Rogue"],
  power: 2,
  toughness: 4,
  text: `${HASTE_TEXT} (Assassins, Mercenaries, Pirates, Rogues, and Warlocks are outlaws.)\n${ENTER_TEXT}`,
  static: [
    {
      affects: {
        scope: "filter",
        filter: { controlledBy: "you", subtypes: OUTLAWS },
        excludeSelf: true,
      },
      grantKeywords: ["haste"],
      text: HASTE_TEXT,
    },
  ],
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: { kind: "create-token", token: "Mercenary Token", count: 2 },
      resolve: null,
      text: ENTER_TEXT,
    },
  ],
});
