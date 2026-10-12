import { defineCard } from "../define.js";

// EDHREC rank 9010.
// Makes Treasure → use "Treasure Token".
//
// Rulings:
//   [2025-09-19] Being suspected isn't a copiable value. If a permanent becomes a copy of a
//     suspected creature, it won't be suspected.
//   [2025-09-19] If a suspected creature loses all abilities, it will lose menace and "This
//     creature can't block," but it won't stop being suspected.
//   [2025-09-19] Though JJJ suspects only one creature when he enters, there is generally no limit
//     to the number of creatures that can be suspected. Suspecting a new creature doesn't cause
//     other creatures to stop being suspected.
//   [2025-09-19] When an effect suspects a creature, it becomes suspected. It gains menace and
//     "This creature can't block" for as long as it's suspected. It stays suspected until it
//     leaves the battlefield or another effect causes it to no longer be suspected.
//   [2025-09-19] If a creature is already suspected, suspecting it again won't have any effect.

// Barbed Servitor's `suspect`, on an optional target; the Treasure trigger
// reads menace however the attacker has it (printed, granted, suspected).
const SUSPECT_TEXT = "When J. Jonah Jameson enters, suspect up to one target creature.";
const TREASURE_TEXT = "Whenever a creature you control with menace attacks, create a Treasure token.";

export default defineCard({
  name: "J. Jonah Jameson",
  manaCost: "{2}{R}",
  colors: ["R"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Citizen"],
  power: 2,
  toughness: 2,
  text: `${SUSPECT_TEXT} (A suspected creature has menace and can't block.)\n${TREASURE_TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [{ kind: "optional", of: "creature" }],
      effect: { kind: "suspect", target: 0 },
      resolve: null,
      text: SUSPECT_TEXT,
    },
    {
      trigger: { on: "attacks", who: "you-control", filter: { type: "creature", keyword: "menace" } },
      targets: [],
      effect: { kind: "create-token", token: "Treasure Token", count: 1 },
      resolve: null,
      text: TREASURE_TEXT,
    },
  ],
});
