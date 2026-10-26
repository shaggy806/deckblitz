import { defineCard } from "../define.js";

// EDHREC rank 29628.
//
// Exactly two targets, as one group: with fewer than two lands to point at
// the ability is removed from the stack (the ruling, rule 603.3d); one that
// has become illegal in response leaves the other to return.

const TEXT = "When this creature enters, return two target lands you control to their owner's hand.";

export default defineCard({
  name: "Sea Drake",
  manaCost: "{2}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Drake"],
  power: 4,
  toughness: 3,
  keywords: ["flying"],
  text: `Flying\n${TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [
        { kind: "any-number", of: { kind: "permanent", filter: { type: "land", controlledBy: "you" } }, min: 2, max: 2 },
      ],
      effect: { kind: "for-each-target", from: 0, effect: { kind: "return-to-hand", target: 0 }, simultaneous: true },
      resolve: null,
      text: TEXT,
    },
  ],
});
