import { defineCard } from "../define.js";

// EDHREC rank 8340.
//
// Rulings:
//   [2025-11-17] If the affected creature gains an ability after Abigale's last ability resolves,
//     it will keep that ability.
//   [2025-11-17] The effect of Abigale's last ability that causes the target creature to lose all
//     abilities lasts indefinitely. It doesn't expire during the cleanup step or when Abigale
//     leaves the battlefield.
//
// The loss is a `"permanent"` layer-6 effect, and the keyword counters go on
// after it: each counter has its own later timestamp (rule 613.7c), so the
// creature keeps flying, first strike and lifelink (rule 122.1b).
const ENTERS_TEXT =
  "When Abigale enters, up to one other target creature loses all abilities. Put a flying counter, a first strike counter, and a lifelink counter on that creature.";

export default defineCard({
  name: "Abigale, Eloquent First-Year",
  manaCost: "{W/B}{W/B}",
  colors: ["W", "B"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Bird", "Bard"],
  power: 1,
  toughness: 1,
  keywords: ["flying", "first-strike", "lifelink"],
  text: `Flying, first strike, lifelink\n${ENTERS_TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [{ kind: "optional", of: { kind: "other", of: "creature" } }],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "lose-abilities", target: 0, duration: "permanent" },
          { kind: "add-counter", target: 0, counter: "flying", amount: 1 },
          { kind: "add-counter", target: 0, counter: "first-strike", amount: 1 },
          { kind: "add-counter", target: 0, counter: "lifelink", amount: 1 },
        ],
      },
      resolve: null,
      text: ENTERS_TEXT,
    },
  ],
});
