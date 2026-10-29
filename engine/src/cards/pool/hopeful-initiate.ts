import { defineCard } from "../define.js";

// REVIEW — auto-finished by `npm run card:scaffold` from the Oracle snapshot: every line
// of its text matched a template, so nothing was left to author. Not in the registry:
// check it against the card's Oracle text, then move it into cards/pool/ (or tokens/)
// and run `npm run gen:cards -w engine`.
// EDHREC rank 5467.

export default defineCard({
  name: "Hopeful Initiate",
  manaCost: "{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Human", "Warlock"],
  power: 1,
  toughness: 2,
  text: "Training (Whenever this creature attacks with another creature with greater power, put a +1/+1 counter on this creature.)\n{2}{W}, Remove two +1/+1 counters from among creatures you control: Destroy target artifact or enchantment.",
  activated: [
    {
      cost: {
        mana: "{2}{W}",
        tap: false,
        removeCounter: { kind: "+1/+1", count: 2, from: { type: "creature" }, among: true },
      },
      targets: ["artifact-or-enchantment"],
      effect: { kind: "destroy", target: 0 },
      resolve: null,
      text: "{2}{W}, Remove two +1/+1 counters from among creatures you control: Destroy target artifact or enchantment.",
    },
  ],
  triggered: [
    {
      trigger: { on: "attacks", who: "self", withGreaterPower: true },
      targets: [],
      effect: { kind: "add-counter", target: "source", counter: "+1/+1", amount: 1, training: true },
      resolve: null,
      text: "Training",
    },
  ],
});
