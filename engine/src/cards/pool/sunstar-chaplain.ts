import { defineCard } from "../define.js";

// EDHREC rank 16580.
//
// The intervening-if is read as the end step begins and again as it resolves
// (rule 603.4 — its ruling).

export default defineCard({
  name: "Sunstar Chaplain",
  manaCost: "{1}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Human", "Cleric"],
  power: 3,
  toughness: 2,
  text: "At the beginning of your end step, if you control two or more tapped creatures, put a +1/+1 counter on target creature you control.\n{2}, Remove a +1/+1 counter from a creature you control: Tap target artifact or creature.",
  activated: [
    {
      cost: {
        mana: "{2}",
        tap: false,
        removeCounter: { kind: "+1/+1", count: 1, from: { type: "creature" } },
      },
      targets: ["artifact-or-creature"],
      effect: { kind: "tap", target: 0 },
      resolve: null,
      text: "{2}, Remove a +1/+1 counter from a creature you control: Tap target artifact or creature.",
    },
  ],
  triggered: [
    {
      trigger: { on: "step-begins", step: "end", who: "you" },
      condition: { kind: "controls", filter: { type: "creature", tapped: true }, atLeast: 2 },
      targets: ["creature-you-control"],
      effect: { kind: "add-counter", target: 0, counter: "+1/+1", amount: 1 },
      resolve: null,
      text: "At the beginning of your end step, if you control two or more tapped creatures, put a +1/+1 counter on target creature you control.",
    },
  ],
});
