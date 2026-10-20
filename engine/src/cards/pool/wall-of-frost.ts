import { defineCard } from "../define.js";

// "That creature" is the one it blocks (`blocks`'s `object: "blocked"`); it
// isn't tapped by this, only skips its controller's next untap step.
const T0 = "Whenever this creature blocks a creature, that creature doesn't untap during its controller's next untap step.";

export default defineCard({
  name: "Wall of Frost",
  manaCost: "{1}{U}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Wall"],
  power: 0,
  toughness: 7,
  keywords: ["defender"],
  text: `Defender\n${T0}`,
  triggered: [
    {
      trigger: { on: "blocks", who: "self", object: "blocked" },
      targets: [],
      effect: { kind: "tap", target: "trigger-object", doesntUntapNext: true, onlyDoesntUntap: true },
      resolve: null,
      text: T0,
    },
  ],
});
