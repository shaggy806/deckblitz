import { defineCard } from "../define.js";

export default defineCard({
  name: "Render Silent",
  manaCost: "{W}{U}{U}",
  colors: ["W", "U"],
  types: ["instant"],
  text: "Counter target spell. Its controller can't cast spells this turn.",
  targets: ["spell"],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "counter", target: 0 },
      { kind: "as-player", who: { controllerOf: 0 }, effect: { kind: "prohibit", prohibits: [{ act: "cast", who: "you" }] } },
    ],
  },
});
