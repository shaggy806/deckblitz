import { defineCard } from "../define.js";

// EDHREC rank 19378.
//
// Rulings:
//   [2016-04-08] Clue is an artifact type. Even though it appears on some cards with other
//     permanent types, it's never a creature type, a land type, or anything but an artifact type.
//   [2016-04-08] If Daring Sleuth's ability triggers multiple times before any of those abilities
//     resolves, only the first one to resolve will cause it to transform.
//   [2016-04-08] If an effect refers to a Clue, it means any Clue artifact, not just a Clue
//     artifact token.
// Graf Mole's trigger. A second trigger finding it already transformed since it
// went on the stack does nothing (rule 701.28f — the engine's `transformSince`).

const TEXT = "When you sacrifice a Clue, transform this creature.";

export default defineCard({
  name: "Daring Sleuth",
  manaCost: "{1}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Human", "Rogue"],
  power: 2,
  toughness: 1,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "sacrifice", who: "you", filter: { subtype: "Clue" } },
      targets: [],
      effect: { kind: "transform", target: "source" },
      resolve: null,
      text: TEXT,
    },
  ],
  faces: ["Daring Sleuth", "Bearer of Overwhelming Truths"],
  transform: true,
});
