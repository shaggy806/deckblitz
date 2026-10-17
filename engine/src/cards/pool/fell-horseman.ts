import { defineCard } from "../define.js";

// EDHREC rank 16137.
//
// Rulings:
//   [2023-09-01] Fell Horseman will be put on the bottom of its owner's library only if it's still
//     in the graveyard when its ability resolves. If it leaves the graveyard before that point, it
//     will stay in whatever zone it's in, even if it's returned to the graveyard before the
//     ability resolves.
//
// Murderous Rider's shape: `put-on-library` of the trigger object, which is
// the card only while it's the same object in the graveyard (rule 400.7).

const TEXT = "When this creature dies, put it on the bottom of its owner's library.";

export default defineCard({
  name: "Fell Horseman",
  manaCost: "{3}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Zombie", "Knight"],
  power: 3,
  toughness: 3,
  text: TEXT,
  faces: ["Fell Horseman", "Deathly Ride"],
  adventure: true,
  triggered: [
    {
      trigger: { on: "dies", who: "self" },
      targets: [],
      effect: { kind: "put-on-library", target: "trigger-object", position: "bottom" },
      resolve: null,
      text: TEXT,
    },
  ],
});
