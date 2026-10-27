import { defineCard } from "../define.js";

// Nemesis (NEM). EDHREC rank 30884.
//
// Fading 5 (rule 702.32) as its two pieces, Parallax Wave's; the ping is
// Monoskelion's shape with fade counters.

const FADING = "Fading 5";
const FADING_UPKEEP =
  "(This creature enters with five fade counters on it. At the beginning of your upkeep, remove a fade counter from it. If you can't, sacrifice it.)";
const PING = "{1}, Remove a fade counter from this creature: It deals 1 damage to any target.";

export default defineCard({
  name: "Ancient Hydra",
  manaCost: "{4}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Hydra"],
  power: 5,
  toughness: 1,
  text: `${FADING} ${FADING_UPKEEP}\n${PING}`,
  static: [
    {
      affects: { scope: "self" },
      replacement: { event: "enters-battlefield", counters: { kind: "fade", amount: 5 } },
      text: FADING,
    },
  ],
  activated: [
    {
      cost: { mana: "{1}", tap: false, removeCounter: { kind: "fade", count: 1 } },
      targets: ["any-target"],
      effect: { kind: "damage", amount: 1, target: 0 },
      resolve: null,
      text: PING,
    },
  ],
  triggered: [
    {
      trigger: { on: "step-begins", step: "upkeep", who: "you" },
      targets: [],
      effect: {
        kind: "conditional",
        condition: { kind: "self-counters", counter: "fade", compare: { op: "gte", n: 1 } },
        then: { kind: "remove-counter", target: "source", counter: "fade", amount: 1 },
        else: { kind: "sacrifice-source" },
      },
      resolve: null,
      text: FADING_UPKEEP,
    },
  ],
});
