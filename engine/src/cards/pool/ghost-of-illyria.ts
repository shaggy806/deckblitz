import { defineCard } from "../define.js";

// EDHREC rank 32668.

const ETB_TEXT =
  "When this creature enters, exile up to one other target nonland permanent you control. Return that card to the battlefield under its owner's control at the beginning of the next end step.";

export default defineCard({
  name: "Ghost of Illyria",
  manaCost: "{3}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Elemental", "Spirit"],
  power: 3,
  toughness: 3,
  keywords: ["flying"],
  text: `Flying\n${ETB_TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [
        {
          kind: "optional",
          of: { kind: "other", of: { kind: "permanent", whose: "you", filter: { notTypes: ["land"] } } },
        },
      ],
      effect: {
        kind: "flicker",
        target: 0,
        returnAt: "next-end-step",
        returnText: "Return the exiled card to the battlefield under its owner's control.",
      },
      resolve: null,
      text: ETB_TEXT,
    },
  ],
});
