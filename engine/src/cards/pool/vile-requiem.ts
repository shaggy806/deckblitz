import { defineCard } from "../define.js";

// EDHREC rank 22361.
// The verse counters are counted as the ability is activated, before it's sacrificed.

const ACTIVATED_TEXT =
  "{1}{B}, Sacrifice this enchantment: Destroy up to X target nonblack creatures, where X is the number of verse counters on this enchantment. They can't be regenerated.";

export default defineCard({
  name: "Vile Requiem",
  manaCost: "{2}{B}{B}",
  colors: ["B"],
  types: ["enchantment"],
  text: `At the beginning of your upkeep, you may put a verse counter on this enchantment.\n${ACTIVATED_TEXT}`,
  triggered: [
    {
      trigger: { on: "step-begins", step: "upkeep", who: "you" },
      targets: [],
      effect: {
        kind: "may",
        prompt: "Put a verse counter on Vile Requiem?",
        effect: { kind: "add-counter", target: "source", counter: "verse", amount: 1 },
      },
      resolve: null,
      text: "At the beginning of your upkeep, you may put a verse counter on this enchantment.",
    },
  ],
  activated: [
    {
      cost: { mana: "{1}{B}", tap: false, sacrifice: "self" },
      targets: [
        {
          kind: "any-number",
          of: "nonblack-creature",
          max: { countersOn: "source", counter: "verse" },
        },
      ],
      effect: {
        kind: "for-each-target",
        from: 0,
        simultaneous: true,
        effect: { kind: "destroy", target: 0, cantBeRegenerated: true },
      },
      resolve: null,
      text: ACTIVATED_TEXT,
    },
  ],
});
