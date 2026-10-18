import { defineCard } from "../define.js";

// EDHREC rank 11740.
//
// Rulings:
//   [2023-02-04] You choose whether to sacrifice Cacophony Scamp as its first ability resolves. No
//     player may respond between the time you sacrifice it and the time you proliferate.
//   [2023-02-04] You don't have to choose every permanent or player that has a counter, only the
//     ones you want to add another counter to.

const DAMAGE_TEXT =
  "Whenever this creature deals combat damage to a player, you may sacrifice it. If you do, proliferate.";
const DIES_TEXT = "When this creature dies, it deals damage equal to its power to any target.";

export default defineCard({
  name: "Cacophony Scamp",
  manaCost: "{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Phyrexian", "Goblin", "Warrior"],
  power: 1,
  toughness: 1,
  text:
    `${DAMAGE_TEXT} (Choose any number of permanents and/or players, then give each another counter of each kind already there.)\n` +
    DIES_TEXT,
  triggered: [
    {
      trigger: { on: "deals-combat-damage-to-player", who: "self" },
      targets: [],
      effect: {
        kind: "may",
        prompt: "Sacrifice Cacophony Scamp to proliferate?",
        effect: { kind: "sacrifice-source", then: { kind: "proliferate" } },
      },
      resolve: null,
      text: DAMAGE_TEXT,
    },
    {
      // Its power as it last existed on the battlefield (Infernal Phantom's shape).
      trigger: { on: "dies", who: "self" },
      targets: ["any-target"],
      effect: { kind: "damage", amount: { powerOf: "source" }, target: 0 },
      resolve: null,
      text: DIES_TEXT,
    },
  ],
});
