import { defineCard } from "../define.js";

// EDHREC rank 14898.

const ENTER_TEXT =
  "When Rescue enters, return up to one other target artifact or creature you control to its owner's hand. If it was an artifact, put a +1/+1 counter on Rescue.";

// "If it was an artifact" asks about the permanent as it last existed on the
// battlefield (a target condition reads the snapshot the move took), and is
// false when no target was chosen.
export default defineCard({
  name: "Rescue, Pepper Potts",
  manaCost: "{1}{U}",
  colors: ["U"],
  supertypes: ["legendary"],
  types: ["artifact", "creature"],
  subtypes: ["Human", "Hero"],
  power: 2,
  toughness: 1,
  keywords: ["flash", "flying"],
  text: `Flash\nFlying\n${ENTER_TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [
        {
          kind: "optional",
          of: { kind: "other", of: { kind: "permanent", whose: "you", filter: { typesAnyOf: ["artifact", "creature"] } } },
        },
      ],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "return-to-hand", target: 0 },
          {
            kind: "conditional",
            condition: { kind: "target", index: 0, filter: { type: "artifact" } },
            then: { kind: "add-counter", target: "source", counter: "+1/+1", amount: 1 },
          },
        ],
      },
      resolve: null,
      text: ENTER_TEXT,
    },
  ],
});
