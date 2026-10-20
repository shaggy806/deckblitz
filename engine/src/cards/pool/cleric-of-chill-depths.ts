import { defineCard } from "../define.js";

// "That creature" is the one it blocks (`blocks`'s `object: "blocked"`); it
// isn't tapped by this, only skips its controller's next untap step.
const T0 = "Whenever this creature blocks a creature, that creature doesn't untap during its controller's next untap step.";

export default defineCard({
  name: "Cleric of Chill Depths",
  manaCost: "{1}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Merfolk", "Cleric"],
  power: 1,
  toughness: 3,
  text: `${T0}`,
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
