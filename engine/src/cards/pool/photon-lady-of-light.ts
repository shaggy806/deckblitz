import { defineCard } from "../define.js";

// EDHREC rank 22799.
// Flickering Hound's flicker, off an attack trigger.

const TEXT =
  "Whenever Photon attacks, exile up to one other target creature you control, then return that card to the battlefield under its owner's control.";

export default defineCard({
  name: "Photon, Lady of Light",
  manaCost: "{3}{W}",
  colors: ["W"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Hero"],
  power: 3,
  toughness: 3,
  keywords: ["flying"],
  text: `Flying\n${TEXT}`,
  triggered: [
    {
      trigger: { on: "attacks", who: "self" },
      targets: [{ kind: "optional", of: { kind: "other", of: "creature-you-control" } }],
      effect: { kind: "flicker", target: 0 },
      resolve: null,
      text: TEXT,
    },
  ],
});
