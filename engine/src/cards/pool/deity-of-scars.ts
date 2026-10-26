import { defineCard } from "../define.js";

export default defineCard({
  name: "Deity of Scars",
  manaCost: "{B/G}{B/G}{B/G}{B/G}{B/G}",
  colors: ["B", "G"],
  types: ["creature"],
  subtypes: ["Spirit", "Avatar"],
  power: 7,
  toughness: 7,
  keywords: ["trample"],
  text: "Trample\nThis creature enters with two -1/-1 counters on it.\n{B/G}, Remove a -1/-1 counter from this creature: Regenerate this creature.",
  activated: [
    {
      cost: { mana: "{B/G}", tap: false, removeCounter: { kind: "-1/-1", count: 1 } },
      targets: [],
      effect: { kind: "regenerate", target: "source" },
      resolve: null,
      text: "{B/G}, Remove a -1/-1 counter from this creature: Regenerate this creature.",
    },
  ],
  static: [
    {
      affects: { scope: "self" },
      replacement: { event: "enters-battlefield", counters: { kind: "-1/-1", amount: 2 } },
      text: "This creature enters with two -1/-1 counters on it.",
    },
  ],
});
