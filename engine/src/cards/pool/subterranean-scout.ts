import { defineCard } from "../define.js";

export default defineCard({
  name: "Subterranean Scout",
  manaCost: "{1}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Goblin", "Scout"],
  power: 2,
  toughness: 1,
  text: "When this creature enters, target creature with power 2 or less can't be blocked this turn.",
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [{ kind: "permanent", filter: { type: "creature", power: { op: "lte", n: 2 } } }],
      effect: { kind: "grant-keyword", target: 0, keyword: "unblockable", duration: "end-of-turn" },
      resolve: null,
      text: "When this creature enters, target creature with power 2 or less can't be blocked this turn.",
    },
  ],
});
