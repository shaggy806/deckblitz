import { defineCard } from "../define.js";

// "That creature" is the one it blocks (`blocks`'s `object: "blocked"`).
const T0 = "Whenever this creature blocks a creature, tap that creature. That creature doesn't untap during its controller's next untap step.";

export default defineCard({
  name: "Vertigo Spawn",
  manaCost: "{1}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Illusion"],
  power: 0,
  toughness: 3,
  keywords: ["defender"],
  text: `Defender\n${T0}`,
  triggered: [
    {
      trigger: { on: "blocks", who: "self", object: "blocked" },
      targets: [],
      effect: { kind: "tap", target: "trigger-object", doesntUntapNext: true },
      resolve: null,
      text: T0,
    },
  ],
});
