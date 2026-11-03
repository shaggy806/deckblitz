import { defineCard } from "../define.js";

// Sacred Boon's shape; "if it's a creature" is asked as this resolves, when the
// delayed ability would be set up.
export default defineCard({
  name: "Scars of the Veteran",
  manaCost: "{4}{W}",
  colors: ["W"],
  types: ["instant"],
  text: "You may exile a white card from your hand rather than pay this spell's mana cost.\nPrevent the next 7 damage that would be dealt to any target this turn. If it's a creature, put a +0/+1 counter on it for each 1 damage prevented this way at the beginning of the next end step.",
  alternativeCost: { mana: "{0}", exileFromHand: { filter: { colors: ["W"] }, text: "a white card" } },
  targets: ["any-target"],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "prevent-damage", target: 0, amount: 7 },
      {
        kind: "conditional",
        condition: { kind: "target", index: 0, filter: { type: "creature" } },
        then: {
          kind: "delayed-trigger",
          at: "next-end-step",
          text: "Put a +0/+1 counter on it for each 1 damage prevented this way.",
          effect: { kind: "add-counter", target: 0, counter: "+0/+1", amount: { damagePreventedThisWay: true } },
        },
      },
    ],
  },
});
