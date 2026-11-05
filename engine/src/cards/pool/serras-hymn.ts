import { defineCard } from "../define.js";

// EDHREC rank 27500. The counters are counted and the prevention divided as it's
// activated (the ruling), before the sacrifice is paid. With none: no targets,
// and nothing useful done.

const SAC_TEXT =
  "Sacrifice this enchantment: Prevent the next X damage that would be dealt this turn to any number of targets, divided as you choose, where X is the number of verse counters on this enchantment.";

export default defineCard({
  name: "Serra's Hymn",
  manaCost: "{W}",
  colors: ["W"],
  types: ["enchantment"],
  text: `At the beginning of your upkeep, you may put a verse counter on this enchantment.\n${SAC_TEXT}`,
  triggered: [
    {
      trigger: { on: "step-begins", step: "upkeep", who: "you" },
      targets: [],
      effect: {
        kind: "may",
        prompt: "Put a verse counter on Serra's Hymn?",
        effect: { kind: "add-counter", target: "source", counter: "verse", amount: 1 },
      },
      resolve: null,
      text: "At the beginning of your upkeep, you may put a verse counter on this enchantment.",
    },
  ],
  activated: [
    {
      cost: { mana: null, tap: false, sacrifice: "self" },
      targets: [{ kind: "any-number", of: "any-target" }],
      divided: { total: { countersOn: "source", counter: "verse" }, slot: 0, of: "damage to prevent" },
      effect: { kind: "prevent-damage-divided", from: 0 },
      resolve: null,
      text: SAC_TEXT,
    },
  ],
});
