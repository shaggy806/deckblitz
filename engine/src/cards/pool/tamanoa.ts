import { defineCard } from "../define.js";

// Coldsnap (CSP). EDHREC rank 26055. Any recipient, once per source per
// damage event with "that much" the total (rule 603.2c).
//
// Rulings:
//   [2006-07-15] Tamanoa's ability triggers no matter who the recipient of the damage is: another
//     player, a creature, or even you.
//   [2006-07-15] A noncreature source is a source that doesn't have the type creature. If a
//     creature card that's not on the battlefield deals damage (for example, a cycled Gempalm
//     Incinerator), Tamanoa's ability won't trigger.

const TEXT = "Whenever a noncreature source you control deals damage, you gain that much life.";

export default defineCard({
  name: "Tamanoa",
  manaCost: "{R}{G}{W}",
  colors: ["W", "R", "G"],
  types: ["creature"],
  subtypes: ["Spirit"],
  power: 2,
  toughness: 4,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "deals-damage", who: "you-control", filter: { notTypes: ["creature"] } },
      targets: [],
      effect: { kind: "gain-life", amount: { triggerValue: true } },
      resolve: null,
      text: TEXT,
    },
  ],
});
