import { defineCard } from "../define.js";

// EDHREC rank 23688. Vessel of Endless Rest's graveyard hate, with the target
// optional ("up to one").
const ETB_TEXT =
  "When this creature enters, put up to one target card from a graveyard on the bottom of its owner's library.";

export default defineCard({
  name: "Swiftgear Drake",
  manaCost: "{5}",
  colors: [],
  types: ["artifact", "creature"],
  subtypes: ["Drake"],
  power: 2,
  toughness: 4,
  keywords: ["flying", "haste"],
  text: `Flying, haste\n${ETB_TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [{ kind: "optional", of: { kind: "card-in-graveyard", whose: "any" } }],
      effect: { kind: "put-on-library", target: 0, position: "bottom" },
      resolve: null,
      text: ETB_TEXT,
    },
  ],
});
