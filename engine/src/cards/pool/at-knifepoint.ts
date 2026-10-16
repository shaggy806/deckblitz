import { defineCard } from "../define.js";

// EDHREC rank 7501. Outlaws are the five creature types the reminder text
// lists (Vihaan, Goldwaker's shape). The token is the shared OTJ Mercenary.
const OUTLAWS = ["Assassin", "Mercenary", "Pirate", "Rogue", "Warlock"];

const FIRST_STRIKE_TEXT = "During your turn, outlaws you control have first strike.";
const CRIME_TEXT =
  'Whenever you commit a crime, create a 1/1 red Mercenary creature token with "{T}: Target creature you control gets +1/+0 until end of turn. Activate only as a sorcery." This ability triggers only once each turn.';

export default defineCard({
  name: "At Knifepoint",
  manaCost: "{1}{B}{R}",
  colors: ["B", "R"],
  types: ["enchantment"],
  text: `${FIRST_STRIKE_TEXT} (Assassins, Mercenaries, Pirates, Rogues, and Warlocks are outlaws.)\n${CRIME_TEXT}`,
  static: [
    {
      affects: { scope: "filter", filter: { controlledBy: "you", subtypes: OUTLAWS } },
      condition: { kind: "your-turn" },
      grantKeywords: ["first-strike"],
      text: FIRST_STRIKE_TEXT,
    },
  ],
  triggered: [
    {
      trigger: { on: "crime-committed", who: "you" },
      targets: [],
      effect: { kind: "create-token", token: "Mercenary Token", count: 1 },
      resolve: null,
      oncePerTurn: true,
      text: CRIME_TEXT,
    },
  ],
});
