import { defineCard } from "../define.js";

// EDHREC rank 10497.
//
// Rulings:
//   Copying a loyalty ability doesn't cause any loyalty counters to be added to or removed from
//     the enchanted planeswalker.
//   You can activate one loyalty ability of each planeswalker you control during each of your
//     turns, whether that ability is one it always has or the one it gains because of Rowan's
//     Talent.
//
// The copy trigger is the host's loyalty ability activated by this Aura's
// controller (`who: "attached"`, `loyalty`, `activator: "you"`): one of an
// opponent's planeswalker it enchants is never theirs to copy.

const GRANTED = "+1: Up to one target creature gets +2/+0 and gains first strike and trample until end of turn.";
const COPY =
  "Whenever you activate a loyalty ability of enchanted planeswalker, copy that ability. You may choose new targets for the copy.";

export default defineCard({
  name: "Rowan's Talent",
  manaCost: "{2}{R}{R}",
  colors: ["R"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  text: `Enchant planeswalker\nEnchanted planeswalker has "[+1]: Up to one target creature gets +2/+0 and gains first strike and trample until end of turn."\n${COPY}`,
  targets: [{ kind: "permanent", filter: { type: "planeswalker" } }],
  static: [
    {
      affects: { scope: "attached" },
      grantsActivated: [
        {
          loyaltyCost: 1,
          cost: { tap: false, mana: null },
          targets: [{ kind: "optional", of: "creature" }],
          effect: {
            kind: "sequence",
            effects: [
              { kind: "modify-pt", target: 0, power: 2, toughness: 0, duration: "end-of-turn" },
              { kind: "grant-keyword", target: 0, keyword: "first-strike", duration: "end-of-turn" },
              { kind: "grant-keyword", target: 0, keyword: "trample", duration: "end-of-turn" },
            ],
          },
          resolve: null,
          text: GRANTED,
        },
      ],
      text: `Enchanted planeswalker has "[+1]: Up to one target creature gets +2/+0 and gains first strike and trample until end of turn."`,
    },
  ],
  triggered: [
    {
      trigger: { on: "activates-ability", who: "attached", loyalty: true, activator: "you" },
      targets: [],
      effect: { kind: "copy-ability", target: "trigger-ability", newTargets: true },
      resolve: null,
      text: COPY,
    },
  ],
});
