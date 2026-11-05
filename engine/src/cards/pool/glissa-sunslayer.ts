import { defineCard } from "../define.js";

// EDHREC rank 1377.
//
// Rulings:
//   [2023-02-04] For the third mode, you choose which counters to remove as the ability resolves.
//     You may remove any three (or fewer) counters, even if the permanent has multiple kinds of
//     counters on it.
//
// The mode is chosen as the trigger goes on the stack (rule 700.2b); the third
// mode's counters are picked as it resolves (`remove-counters`, any kinds, up to
// three).
const TEXT =
  "Whenever Glissa Sunslayer deals combat damage to a player, choose one —\n• You draw a card and lose 1 life.\n• Destroy target enchantment.\n• Remove up to three counters from target permanent.";

export default defineCard({
  name: "Glissa Sunslayer",
  manaCost: "{1}{B}{G}",
  colors: ["B", "G"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Phyrexian", "Zombie", "Elf"],
  power: 3,
  toughness: 3,
  keywords: ["first-strike", "deathtouch"],
  text: `First strike, deathtouch\n${TEXT}`,
  triggered: [
    {
      trigger: { on: "deals-combat-damage-to-player", who: "self" },
      targets: [],
      effect: {
        kind: "modal",
        announced: true,
        minModes: 1,
        maxModes: 1,
        modes: [
          {
            text: "You draw a card and lose 1 life.",
            effect: {
              kind: "sequence",
              effects: [
                { kind: "draw", amount: 1 },
                { kind: "lose-life", amount: 1 },
              ],
            },
          },
          {
            text: "Destroy target enchantment.",
            targets: ["enchantment"],
            effect: { kind: "destroy", target: 0 },
          },
          {
            text: "Remove up to three counters from target permanent.",
            targets: ["permanent"],
            effect: { kind: "remove-counters", target: 0, counter: "any", count: 3, upTo: true },
          },
        ],
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
