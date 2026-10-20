import { defineCard } from "../define.js";
import { vanishing } from "../helpers.js";

// One ability with two trigger events (`sameAbilityAs`), each exiling until
// this leaves; every card it exiled comes back together as it leaves.
const EXILE_TEXT =
  "When this enchantment enters and at the beginning of your first main phase, exile target creature an opponent controls until this enchantment leaves the battlefield.";

export default defineCard({
  name: "Crack in Time",
  manaCost: "{3}{W}",
  colors: ["W"],
  types: ["enchantment"],
  text: `Vanishing 3 (This enchantment enters with three time counters on it. At the beginning of your upkeep, remove a time counter from it. When the last is removed, sacrifice it.)\n${EXILE_TEXT}`,
  static: [...vanishing(3).static],
  triggered: [
    ...vanishing(3).triggered,
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: ["creature-an-opponent-controls"],
      effect: { kind: "exile", target: 0, untilSourceLeaves: true },
      resolve: null,
      text: EXILE_TEXT,
    },
    {
      trigger: { on: "step-begins", step: "precombat-main", who: "you" },
      sameAbilityAs: 2,
      targets: ["creature-an-opponent-controls"],
      effect: { kind: "exile", target: 0, untilSourceLeaves: true },
      resolve: null,
      text: EXILE_TEXT,
    },
  ],
});
