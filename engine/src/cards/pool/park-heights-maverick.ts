import { defineCard } from "../define.js";

// Streets of New Capenna Commander.
//
// Rulings:
//   [2022-04-29] If Park Heights Maverick has a +1/+1 counter on it and is dealt lethal damage, it
//     will die before its triggered ability resolves and you proliferate. You won't be able to add
//     a +1/+1 counter to it in time to save it.
//
// Dethrone is Enraged Revolutionary's; "deals combat damage to a player or
// dies" is two triggers, Bloated Contaminator's and Gulping Scraptrap's.
const DETHRONE_TEXT =
  "Dethrone (Whenever this creature attacks the player with the most life or tied for most life, put a +1/+1 counter on it.)";
const UNBLOCKABLE_TEXT = "This creature can't be blocked by creatures with power 2 or less.";
const PROLIFERATE_TEXT = "Whenever this creature deals combat damage to a player or dies, proliferate.";

export default defineCard({
  name: "Park Heights Maverick",
  manaCost: "{2}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Human", "Soldier"],
  power: 2,
  toughness: 2,
  text: `${DETHRONE_TEXT}\n${UNBLOCKABLE_TEXT}\n${PROLIFERATE_TEXT}`,
  triggered: [
    {
      trigger: { on: "attacks", who: "self", defenderLife: "most" },
      targets: [],
      effect: { kind: "add-counter", target: "source", counter: "+1/+1", amount: 1 },
      resolve: null,
      text: "Dethrone",
    },
    {
      trigger: { on: "deals-combat-damage-to-player", who: "self" },
      targets: [],
      effect: { kind: "proliferate" },
      resolve: null,
      text: PROLIFERATE_TEXT,
    },
    {
      trigger: { on: "dies", who: "self" },
      targets: [],
      effect: { kind: "proliferate" },
      resolve: null,
      text: PROLIFERATE_TEXT,
    },
  ],
  static: [
    {
      affects: { scope: "self" },
      cantBeBlockedBy: { power: { op: "lte", n: 2 } },
      text: UNBLOCKABLE_TEXT,
    },
  ],
});
