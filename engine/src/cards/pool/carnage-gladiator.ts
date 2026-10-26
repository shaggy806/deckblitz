import { defineCard } from "../define.js";

// EDHREC rank 20474.
//
// Any creature blocking, whoever controls it — once per blocker, however
// many creatures it blocks (the rulings).

const TEXT = "Whenever a creature blocks, that creature's controller loses 1 life.";

export default defineCard({
  name: "Carnage Gladiator",
  manaCost: "{2}{B}{R}",
  colors: ["B", "R"],
  types: ["creature"],
  subtypes: ["Skeleton", "Warrior"],
  power: 4,
  toughness: 2,
  text: `${TEXT}\n{1}{B}{R}: Regenerate this creature.`,
  triggered: [
    {
      trigger: { on: "blocks", who: "any", filter: { type: "creature" } },
      targets: [],
      effect: { kind: "lose-life", amount: 1, who: "trigger-controller" },
      resolve: null,
      text: TEXT,
    },
  ],
  activated: [
    {
      cost: { mana: "{1}{B}{R}", tap: false },
      targets: [],
      effect: { kind: "regenerate", target: "source" },
      resolve: null,
      text: "{1}{B}{R}: Regenerate this creature.",
    },
  ],
});
