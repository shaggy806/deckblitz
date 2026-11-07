import { defineCard } from "../define.js";

// EDHREC rank 3204.
//
// Rulings:
//   You can tap any untapped creature you control to pay the escalate cost, including one you
//     haven't controlled continuously since the beginning of the turn.
//   If an effect allows you to cast a spell that has escalate without paying its mana cost, you
//     pay escalate costs for that spell if you choose more than one mode.
//   If two of the chosen modes of an escalate spell target a creature, you may choose the same
//     creature for each mode's target, or choose different creatures.
//
// Escalate's tap is `castModal.alsoPerExtraMode` (rule 702.120a): one creature
// for each mode beyond the first, picked from the cast's `tapCost` offer.

export default defineCard({
  name: "Collective Effort",
  manaCost: "{1}{W}{W}",
  colors: ["W"],
  types: ["sorcery"],
  text:
    "Escalate—Tap an untapped creature you control. (Pay this cost for each mode chosen beyond the first.)\n" +
    "Choose one or more —\n" +
    "• Destroy target creature with power 4 or greater.\n" +
    "• Destroy target enchantment.\n" +
    "• Put a +1/+1 counter on each creature target player controls.",
  targets: [],
  castModal: {
    minModes: 1,
    maxModes: 3,
    alsoPerExtraMode: {
      text: "Tap an untapped creature you control",
      tapUntapped: { filter: { type: "creature" }, count: 1 },
    },
    modes: [
      {
        text: "Destroy target creature with power 4 or greater.",
        targets: [{ kind: "permanent", filter: { type: "creature", power: { op: "gte", n: 4 } } }],
        effect: { kind: "destroy", target: 0 },
      },
      {
        text: "Destroy target enchantment.",
        targets: ["enchantment"],
        effect: { kind: "destroy", target: 0 },
      },
      {
        text: "Put a +1/+1 counter on each creature target player controls.",
        targets: ["player"],
        effect: {
          kind: "add-counter-all",
          filter: { type: "creature", controlledBy: "you" },
          counter: "+1/+1",
          amount: 1,
          controlledByTarget: 0,
        },
      },
    ],
  },
});
