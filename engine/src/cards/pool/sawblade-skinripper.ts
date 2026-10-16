import { defineCard } from "../define.js";

// EDHREC rank 14521.
//
// Rulings:
//   [2024-09-20] If you haven't sacrificed any permanents during your turn by the time your end
//     step begins, Sawblade Skinripper's last ability won't trigger at all. You won't be able to
//     sacrifice anything during your end step in time to have the ability trigger.
//
// "That much" is the number of permanents you sacrificed this turn, read as
// the ability resolves (a token stack counting each token).
const SAC_TEXT = "{2}, Sacrifice another creature or enchantment: Put a +1/+1 counter on this creature.";
const END_TEXT =
  "At the beginning of your end step, if you sacrificed one or more permanents this turn, this creature deals that much damage to any target.";

export default defineCard({
  name: "Sawblade Skinripper",
  manaCost: "{1}{B}{R}",
  colors: ["B", "R"],
  types: ["creature"],
  subtypes: ["Human", "Assassin"],
  power: 3,
  toughness: 2,
  keywords: ["menace"],
  text: `Menace\n${SAC_TEXT}\n${END_TEXT}`,
  activated: [
    {
      cost: {
        mana: "{2}",
        tap: false,
        sacrifice: { filter: { typesAnyOf: ["creature", "enchantment"] } },
      },
      targets: [],
      effect: { kind: "add-counter", target: "source", counter: "+1/+1", amount: 1 },
      resolve: null,
      text: SAC_TEXT,
      otherOnly: true,
    },
  ],
  triggered: [
    {
      trigger: { on: "step-begins", step: "end", who: "you" },
      condition: { kind: "turn-history", what: "sacrificed", who: "you" },
      targets: ["any-target"],
      effect: { kind: "damage", amount: { turnHistory: "sacrificed", who: "you" }, target: 0 },
      resolve: null,
      text: END_TEXT,
    },
  ],
});
