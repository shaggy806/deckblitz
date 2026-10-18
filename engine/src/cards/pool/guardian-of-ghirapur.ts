import { defineCard } from "../define.js";

// EDHREC rank 7963.

const TEXT =
  "When this creature enters, exile up to one other target creature or artifact you control. Return it to the battlefield under its owner's control at the beginning of the next end step.";

export default defineCard({
  name: "Guardian of Ghirapur",
  manaCost: "{2}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Angel"],
  power: 3,
  toughness: 3,
  keywords: ["flying"],
  text: `Flying\n${TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [
        {
          kind: "optional",
          of: {
            kind: "other",
            of: {
              kind: "permanent",
              whose: "you",
              filter: { anyOf: [{ type: "creature" }, { type: "artifact" }] },
            },
          },
        },
      ],
      effect: {
        kind: "flicker",
        target: 0,
        returnAt: "next-end-step",
        returnText: "Return the exiled card to the battlefield under its owner's control.",
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
