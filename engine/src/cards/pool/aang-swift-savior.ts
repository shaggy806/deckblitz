import { defineCard } from "../define.js";

// One slot for a spell or another creature (`one-of`); a spell airbended is
// exiled from the stack, not countered (its ruling).
const AIRBEND = "When Aang enters, airbend up to one other target creature or spell. (Exile it. While it's exiled, its owner may cast it for {2} rather than its mana cost.)";
const WATERBEND = "Waterbend {8}: Transform Aang.";

export default defineCard({
  name: "Aang, Swift Savior",
  manaCost: "{1}{W}{U}",
  colors: ["W", "U"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Avatar", "Ally"],
  power: 2,
  toughness: 3,
  keywords: ["flash", "flying"],
  text: `Flash\nFlying\n${AIRBEND}\n${WATERBEND} (While paying a waterbend cost, you can tap your artifacts and creatures to help. Each one pays for {1}.)`,
  activated: [
    {
      cost: { mana: "{8}", tap: false, waterbend: true },
      targets: [],
      effect: { kind: "transform", target: "source" },
      resolve: null,
      text: WATERBEND,
    },
  ],
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [{ kind: "optional", of: { kind: "one-of", of: ["spell", { kind: "other", of: "creature" }] } }],
      effect: { kind: "exile", target: 0, airbend: true },
      resolve: null,
      text: AIRBEND,
    },
  ],
  faces: ["Aang, Swift Savior", "Aang and La, Ocean's Fury"],
  transform: true,
});
