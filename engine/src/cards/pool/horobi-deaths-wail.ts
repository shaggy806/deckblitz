import { defineCard } from "../define.js";

// EDHREC rank 10380.
//
// Rulings:
//   [2023-04-14] If the creature is the only target of the spell or ability, that spell or ability
//     won't resolve.
// Any creature, whoever controls it and whoever targets it — Horobi itself included.

const TEXT = "Whenever a creature becomes the target of a spell or ability, destroy that creature.";

export default defineCard({
  name: "Horobi, Death's Wail",
  manaCost: "{2}{B}{B}",
  colors: ["B"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Spirit"],
  power: 4,
  toughness: 4,
  keywords: ["flying"],
  text: `Flying\n${TEXT}`,
  triggered: [
    {
      trigger: { on: "becomes-target", who: "any", filter: { type: "creature" } },
      targets: [],
      effect: { kind: "destroy", target: "trigger-object" },
      resolve: null,
      text: TEXT,
    },
  ],
});
