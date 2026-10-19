import { defineCard } from "../define.js";

// EDHREC rank 8493.

export default defineCard({
  name: "Agent's Toolkit",
  manaCost: "{1}{G}{U}",
  colors: ["U", "G"],
  types: ["artifact"],
  subtypes: ["Clue"],
  text: "This artifact enters with a +1/+1 counter, a flying counter, a deathtouch counter, and a shield counter on it. (If it would be dealt damage or destroyed, remove a shield counter from it instead.)\nWhenever a creature you control enters, you may move a counter from this artifact onto that creature.\n{2}, Sacrifice this artifact: Draw a card.",
  activated: [
    {
      cost: { mana: "{2}", tap: false, sacrifice: "self" },
      targets: [],
      effect: { kind: "draw", amount: 1 },
      resolve: null,
      text: "{2}, Sacrifice this artifact: Draw a card.",
    },
  ],
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "you-control", filter: { type: "creature" } },
      targets: [],
      // A counter of a kind chosen as it resolves, among those still on it
      // (move-counters with no kind — the Nesting Grounds ruling).
      effect: {
        kind: "may",
        prompt: "Move a counter from Agent's Toolkit onto that creature?",
        effect: { kind: "move-counters", from: "source", to: "trigger-object" },
      },
      resolve: null,
      text: "Whenever a creature you control enters, you may move a counter from this artifact onto that creature.",
    },
  ],
  static: (["+1/+1", "flying", "deathtouch", "shield"] as const).map((kind) => ({
    affects: { scope: "self" as const },
    replacement: { event: "enters-battlefield" as const, counters: { kind, amount: 1 } },
    text: "This artifact enters with a +1/+1 counter, a flying counter, a deathtouch counter, and a shield counter on it.",
  })),
});
