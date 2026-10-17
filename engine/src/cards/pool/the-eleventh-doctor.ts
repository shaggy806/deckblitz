import { defineCard } from "../define.js";

// "You may exile a card from your hand": none, or one of any kind. Its mana
// value in time counters, and suspend (`give-suspend`); a card of mana value
// 0 gets no counter and so isn't suspended (rule 702.62b) — it stays exiled.
const TALKING_TEXT =
  "I. AM. TALKING! — Whenever The Eleventh Doctor deals combat damage to a player, you may exile a card from your hand with a number of time counters on it equal to its mana value. If it doesn't have suspend, it gains suspend.";

export default defineCard({
  name: "The Eleventh Doctor",
  manaCost: "{1}{W}{U}",
  colors: ["W", "U"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Time Lord", "Doctor"],
  power: 3,
  toughness: 2,
  text: `${TALKING_TEXT}\n{2}: Target creature with power 3 or less can't be blocked this turn.`,
  triggered: [
    {
      trigger: { on: "deals-combat-damage-to-player", who: "self" },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "look-and-choose", zone: "hand", min: 0, max: 1, destination: "exile", leftover: "stay" },
          { kind: "give-suspend", timeCounters: "mana-value" },
        ],
      },
      resolve: null,
      text: TALKING_TEXT,
    },
  ],
  activated: [
    {
      cost: { mana: "{2}", tap: false },
      targets: [{ kind: "permanent", filter: { type: "creature", power: { op: "lte", n: 3 } } }],
      effect: { kind: "grant-keyword", target: 0, keyword: "unblockable", duration: "end-of-turn" },
      resolve: null,
      text: "{2}: Target creature with power 3 or less can't be blocked this turn.",
    },
  ],
});
