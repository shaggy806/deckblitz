import { defineCard } from "../define.js";

// EDHREC rank 16527. The Brothers' War.

const DIES_TEXT =
  "When this creature dies, put up to one other target card from a graveyard on the bottom of its owner's library.";

export default defineCard({
  name: "Hoarding Recluse",
  manaCost: "{3}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Spider"],
  power: 2,
  toughness: 3,
  keywords: ["reach", "deathtouch"],
  text: `Reach, deathtouch\n${DIES_TEXT}`,
  triggered: [
    {
      trigger: { on: "dies", who: "self" },
      // "Other": not this card, which is in the graveyard as the trigger
      // chooses its target.
      targets: [{ kind: "optional", of: { kind: "other", of: { kind: "card-in-graveyard", whose: "any" } } }],
      effect: { kind: "put-on-library", target: 0, position: "bottom" },
      resolve: null,
      text: DIES_TEXT,
    },
  ],
});
