import { defineCard } from "../define.js";

// Mirrodin (MRD). EDHREC rank 10891.
//
// "If you cast it from your hand" reads how the entering object got there, so a
// Clone cast from hand that copies it triggers too (the ruling).

const TEXT =
  "When this creature enters, if you cast it from your hand, destroy all nonartifact, nonblack creatures. They can't be regenerated.";

export default defineCard({
  name: "Reiver Demon",
  manaCost: "{4}{B}{B}{B}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Demon"],
  power: 6,
  toughness: 6,
  keywords: ["flying"],
  text: `Flying\n${TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self", filter: { cast: true, castBy: "you", castFrom: "hand" } },
      targets: [],
      effect: {
        kind: "destroy-all",
        filter: { type: "creature", notTypes: ["artifact"], notColors: ["B"] },
        cantBeRegenerated: true,
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
