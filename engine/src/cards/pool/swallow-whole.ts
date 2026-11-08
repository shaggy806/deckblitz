import { defineCard } from "../define.js";

// Rulings:
//   [2020-04-17] You must tap exactly one creature to cast Swallow Whole; you can't cast it without
//     tapping a creature, and you can't tap additional creatures.
//   [2020-04-17] If an effect copies Swallow Whole, the copy will put a +1/+1 counter on the creature
//     tapped to pay the additional cost of the original spell.
//   [2020-04-17] If the target creature is an illegal target by the time Swallow Whole tries to
//     resolve, the spell won't resolve. You won't put a +1/+1 counter on any creature.
//   [2020-04-17] You can tap any untapped creature you control, including a creature you haven't
//     controlled continuously since the beginning of your most recent turn, to pay the additional
//     cost.
//   [2020-04-17] The target tapped creature will be exiled even if the creature you tapped leaves the
//     battlefield or becomes untapped before Swallow Whole resolves.

export default defineCard({
  name: "Swallow Whole",
  manaCost: "{W}",
  colors: ["W"],
  types: ["sorcery"],
  text: "As an additional cost to cast this spell, tap an untapped creature you control.\nExile target tapped creature. Put a +1/+1 counter on the creature tapped to pay this spell's additional cost.",
  additionalCost: {
    also: { text: "Tap an untapped creature you control", tapUntapped: { filter: { type: "creature" }, count: 1 } },
  },
  targets: [{ kind: "permanent", filter: { type: "creature", tapped: true } }],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "exile", target: 0 },
      { kind: "add-counter", target: { paid: "tapped" }, counter: "+1/+1", amount: 1 },
    ],
  },
});
