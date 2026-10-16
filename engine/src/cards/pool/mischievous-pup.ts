import { defineCard } from "../define.js";

// EDHREC rank 12497. The Lost Caverns of Ixalan.
//
// Exosuit Savior's enters trigger, on a flash creature.

const TEXT = "When this creature enters, return up to one other target permanent you control to its owner's hand.";

export default defineCard({
  name: "Mischievous Pup",
  manaCost: "{2}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Dog"],
  power: 3,
  toughness: 1,
  keywords: ["flash"],
  text: `Flash (You may cast this spell any time you could cast an instant.)\n${TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [{ kind: "optional", of: { kind: "other", of: { kind: "permanent", whose: "you", filter: {} } } }],
      effect: { kind: "return-to-hand", target: 0 },
      resolve: null,
      text: TEXT,
    },
  ],
});
