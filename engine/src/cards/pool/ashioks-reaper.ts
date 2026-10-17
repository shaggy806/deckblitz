import { defineCard } from "../define.js";

// Rulings:
//   [2023-09-01] Enchantment tokens (such as Roles) that are sacrificed, destroyed, or would
//     otherwise go to the graveyard are put into their owner's graveyard before ceasing to exist.
//     If you controlled the token, Ashiok's Reaper's ability will trigger.

// "Put into a graveyard from the battlefield" is the `dies` trigger, which
// fires for any permanent type (Starfield Mystic's shape).
const TEXT = "Whenever an enchantment you control is put into a graveyard from the battlefield, draw a card.";

export default defineCard({
  name: "Ashiok's Reaper",
  manaCost: "{3}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Nightmare"],
  power: 3,
  toughness: 3,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "dies", who: "you-control", filter: { type: "enchantment" } },
      targets: [],
      effect: { kind: "draw", amount: 1 },
      resolve: null,
      text: TEXT,
    },
  ],
});
