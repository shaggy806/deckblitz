import { defineCard } from "../define.js";

// Rulings:
//   If the targeted spell can't be countered, it won't be put onto the bottom of its owner's
//     library. Spell Crumple will still be put on the bottom of its owner's library.
//   If the spell is an illegal target when Spell Crumple tries to resolve, it won't resolve and
//     none of its effects will happen. Spell Crumple will be put into its owner's graveyard.
export default defineCard({
  name: "Spell Crumple",
  manaCost: "{1}{U}{U}",
  colors: ["U"],
  types: ["instant"],
  text: "Counter target spell. If that spell is countered this way, put it on the bottom of its owner's library instead of into that player's graveyard. Put Spell Crumple on the bottom of its owner's library.",
  targets: ["spell"],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "counter", target: 0, into: "library-bottom" },
      { kind: "put-on-library", target: "source", position: "bottom" },
    ],
  },
});
