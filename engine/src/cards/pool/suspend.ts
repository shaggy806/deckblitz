import { defineCard } from "../define.js";

// The creature card exiled this way gets the counters and suspend; its owner
// may play it as the last comes off. A token exiled ceases to exist (rule
// 111.7), so there's nothing to suspend.
export default defineCard({
  name: "Suspend",
  manaCost: "{U}",
  colors: ["U"],
  types: ["instant"],
  text: "Exile target creature and put two time counters on it. If it doesn't have suspend, it gains suspend. (At the beginning of its owner's upkeep, they remove a time counter. When the last is removed, they may play it without paying its mana cost. If it's a creature, it has haste.)",
  targets: ["creature"],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "exile", target: 0 },
      { kind: "give-suspend", timeCounters: 2 },
    ],
  },
});
