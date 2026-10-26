import { defineCard } from "../define.js";

// EDHREC rank 28581.

const ENTERS = "When this creature enters, sacrifice a creature.";
const REGEN = "{B}: Regenerate this creature.";

export default defineCard({
  name: "Spined Fluke",
  manaCost: "{2}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Worm", "Horror"],
  power: 5,
  toughness: 1,
  text: `${ENTERS}\n${REGEN}`,
  activated: [
    {
      cost: { mana: "{B}", tap: false },
      targets: [],
      effect: { kind: "regenerate", target: "source" },
      resolve: null,
      text: REGEN,
    },
  ],
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: { kind: "sacrifice", who: "you", filter: { type: "creature" }, count: 1 },
      resolve: null,
      text: ENTERS,
    },
  ],
});
