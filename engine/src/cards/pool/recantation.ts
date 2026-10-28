import { defineCard } from "../define.js";

const UPKEEP_TEXT = "At the beginning of your upkeep, you may put a verse counter on this enchantment.";
const BOUNCE_TEXT =
  "{U}, Sacrifice this enchantment: Return up to X target permanents to their owners' hands, where X is the number of verse counters on this enchantment.";

// Serra's Liturgy's shape: the verse counters are counted as the targets are
// chosen, before the enchantment is sacrificed to pay the cost.
export default defineCard({
  name: "Recantation",
  manaCost: "{3}{U}{U}",
  colors: ["U"],
  types: ["enchantment"],
  text: `${UPKEEP_TEXT}\n${BOUNCE_TEXT}`,
  activated: [
    {
      cost: { mana: "{U}", tap: false, sacrifice: "self" },
      targets: [{ kind: "any-number", of: "permanent", max: { countersOn: "source", counter: "verse" } }],
      effect: {
        kind: "for-each-target",
        from: 0,
        simultaneous: true,
        effect: { kind: "return-to-hand", target: 0 },
      },
      resolve: null,
      text: BOUNCE_TEXT,
    },
  ],
  triggered: [
    {
      trigger: { on: "step-begins", step: "upkeep", who: "you" },
      targets: [],
      effect: {
        kind: "may",
        prompt: "Put a verse counter on Recantation?",
        effect: { kind: "add-counter", target: "source", counter: "verse", amount: 1 },
      },
      resolve: null,
      text: UPKEEP_TEXT,
    },
  ],
});
