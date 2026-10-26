import { defineCard } from "../define.js";

const ENTER_TEXT = "This enchantment enters with X charge counters on it.";
const MANA_TEXT = "Remove a charge counter from this enchantment: Add one mana of any color. Activate only once each turn.";
const UPKEEP_TEXT =
  "At the beginning of your upkeep, if this enchantment has no charge counters on it, return it to its owner's hand.";

export default defineCard({
  name: "Mana Bloom",
  manaCost: "{X}{G}",
  colors: ["G"],
  types: ["enchantment"],
  text: `${ENTER_TEXT}\n${MANA_TEXT}\n${UPKEEP_TEXT}`,
  static: [
    {
      affects: { scope: "self" },
      replacement: { event: "enters-battlefield", counters: { kind: "charge", amount: "x" } },
      text: ENTER_TEXT,
    },
  ],
  activated: [
    {
      cost: { mana: null, tap: false, removeCounter: { kind: "charge", count: 1 } },
      targets: [],
      effect: { kind: "add-mana", mana: "any-color", amount: 1 },
      resolve: null,
      text: MANA_TEXT,
      oncePerTurn: true,
    },
  ],
  triggered: [
    {
      trigger: { on: "step-begins", step: "upkeep", who: "you" },
      condition: { kind: "self-counters", counter: "charge", compare: { op: "eq", n: 0 } },
      targets: [],
      effect: { kind: "return-to-hand", target: "source" },
      resolve: null,
      text: UPKEEP_TEXT,
    },
  ],
});
