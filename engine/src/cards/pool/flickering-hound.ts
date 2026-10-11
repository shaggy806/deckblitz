import { defineCard } from "../define.js";

// EDHREC rank 11065.

const FLICKER_TEXT =
  "Whenever you cast a creature spell, exile up to one other target creature you control, then return that card to the battlefield under its owner's control.";

export default defineCard({
  name: "Flickering Hound",
  manaCost: "{3}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Dog"],
  power: 2,
  toughness: 2,
  text: FLICKER_TEXT,
  triggered: [
    {
      trigger: { on: "cast-spell", who: "you", filter: { type: "creature" } },
      // "Other": not the Hound itself (an `other` with no `than` excludes the
      // source).
      targets: [{ kind: "optional", of: { kind: "other", of: "creature-you-control" } }],
      effect: { kind: "flicker", target: 0 },
      resolve: null,
      text: FLICKER_TEXT,
    },
  ],
});
