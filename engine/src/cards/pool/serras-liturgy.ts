import { defineCard } from "../define.js";

// Discordant Dirge's verse counters. X is read as the ability is activated,
// before the enchantment is sacrificed to pay for it (rules 601.2c, 602.2b),
// and that's how many targets it may have.
const ACTIVATED_TEXT =
  "{W}, Sacrifice this enchantment: Destroy up to X target artifacts and/or enchantments, where X is the number of verse counters on this enchantment.";

export default defineCard({
  name: "Serra's Liturgy",
  manaCost: "{2}{W}{W}",
  colors: ["W"],
  types: ["enchantment"],
  text: `At the beginning of your upkeep, you may put a verse counter on this enchantment.\n${ACTIVATED_TEXT}`,
  triggered: [
    {
      trigger: { on: "step-begins", step: "upkeep", who: "you" },
      targets: [],
      effect: {
        kind: "may",
        prompt: "Put a verse counter on Serra's Liturgy?",
        effect: { kind: "add-counter", target: "source", counter: "verse", amount: 1 },
      },
      resolve: null,
      text: "At the beginning of your upkeep, you may put a verse counter on this enchantment.",
    },
  ],
  activated: [
    {
      cost: { mana: "{W}", tap: false, sacrifice: "self" },
      targets: [
        {
          kind: "any-number",
          of: "artifact-or-enchantment",
          max: { countersOn: "source", counter: "verse" },
        },
      ],
      effect: {
        kind: "for-each-target",
        from: 0,
        simultaneous: true,
        effect: { kind: "destroy", target: 0 },
      },
      resolve: null,
      text: ACTIVATED_TEXT,
    },
  ],
});
