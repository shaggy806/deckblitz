import { defineCard } from "../define.js";

// Streets of New Capenna.
//
// Rulings:
//   [2022-04-29] Maestros Diabolist's triggered ability has an "intervening 'if'" clause. This
//     means that it checks to see if you control a Devil token both when the ability triggers and
//     when it resolves. Notably, this means that attacking with two Maestros Diabolists will
//     normally cause you to create only one Devil token.
//
// Butterbur's intervening "if you don't control a Food" (a trigger's
// `condition`, asked as it triggers and as it resolves), here a Devil
// *token*; Skyknight Vanguard's tapped-and-attacking token; Zariel's Devil.
const TRIGGER_TEXT =
  'Whenever this creature attacks, if you don\'t control a Devil token, create a tapped and attacking 1/1 red Devil creature token with "When this token dies, it deals 1 damage to any target."';

export default defineCard({
  name: "Maestros Diabolist",
  manaCost: "{U}{B}{R}",
  colors: ["U", "B", "R"],
  types: ["creature"],
  subtypes: ["Vampire", "Warrior"],
  power: 1,
  toughness: 4,
  keywords: ["deathtouch", "haste"],
  text: `Deathtouch, haste\n${TRIGGER_TEXT}`,
  triggered: [
    {
      trigger: { on: "attacks", who: "self" },
      condition: { kind: "not", of: { kind: "controls", filter: { subtype: "Devil", token: true }, atLeast: 1 } },
      targets: [],
      effect: { kind: "create-token", token: "Devil Token", count: 1, tapped: true, attacking: "choose" },
      resolve: null,
      text: TRIGGER_TEXT,
    },
  ],
});
