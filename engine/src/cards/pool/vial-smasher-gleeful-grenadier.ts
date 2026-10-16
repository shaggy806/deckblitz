import { defineCard } from "../define.js";

// EDHREC rank 10413.
//
// Outlaws are the five creature types the reminder text lists (Vihaan,
// Goldwaker's list); an entering permanent with any of them is one.
const OUTLAWS = ["Assassin", "Mercenary", "Pirate", "Rogue", "Warlock"];
const ENTER_TEXT = "Whenever another outlaw you control enters, Vial Smasher deals 1 damage to target opponent.";

export default defineCard({
  name: "Vial Smasher, Gleeful Grenadier",
  manaCost: "{B}{R}",
  colors: ["B", "R"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Goblin", "Mercenary"],
  power: 3,
  toughness: 2,
  text: `${ENTER_TEXT} (Assassins, Mercenaries, Pirates, Rogues, and Warlocks are outlaws.)`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "you-control", filter: { subtypes: OUTLAWS }, otherOnly: true },
      targets: ["opponent"],
      effect: { kind: "damage", amount: 1, target: 0 },
      resolve: null,
      text: ENTER_TEXT,
    },
  ],
});
