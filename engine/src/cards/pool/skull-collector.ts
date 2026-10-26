import { defineCard } from "../define.js";

// Saviors of Kamigawa (SOK). The upkeep return isn't optional and doesn't
// target: a black creature you control is chosen as it resolves (this one
// included), none if you control none (Roaring Primadox's shape).
const UPKEEP_TEXT = "At the beginning of your upkeep, return a black creature you control to its owner's hand.";

export default defineCard({
  name: "Skull Collector",
  manaCost: "{1}{B}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Ogre", "Warrior"],
  power: 3,
  toughness: 3,
  text: `${UPKEEP_TEXT}\n{1}{B}: Regenerate this creature.`,
  triggered: [
    {
      trigger: { on: "step-begins", step: "upkeep", who: "you" },
      targets: [],
      effect: {
        kind: "choose-permanents",
        filter: { type: "creature", colors: ["B"], controlledBy: "you" },
        min: 1,
        upTo: 1,
        then: { kind: "return-to-hand", target: 0 },
        prompt: "Return a black creature you control to its owner's hand",
      },
      resolve: null,
      text: UPKEEP_TEXT,
    },
  ],
  activated: [
    {
      cost: { mana: "{1}{B}", tap: false },
      targets: [],
      effect: { kind: "regenerate", target: "source" },
      resolve: null,
      text: "{1}{B}: Regenerate this creature.",
    },
  ],
});
