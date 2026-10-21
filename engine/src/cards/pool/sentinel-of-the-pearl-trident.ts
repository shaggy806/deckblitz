import { defineCard } from "../define.js";

// EDHREC rank 24129.

const ENTERS_TEXT =
  "When this creature enters, you may exile target historic permanent you control. If you do, return that card to the battlefield under its owner's control at the beginning of the next end step. (Artifacts, legendaries, and Sagas are historic.)";

export default defineCard({
  name: "Sentinel of the Pearl Trident",
  manaCost: "{4}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Merfolk", "Soldier"],
  power: 3,
  toughness: 3,
  keywords: ["flash"],
  text: `Flash\n${ENTERS_TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [
        {
          kind: "permanent",
          whose: "you",
          filter: { anyOf: [{ type: "artifact" }, { supertype: "legendary" }, { subtype: "Saga" }] },
        },
      ],
      effect: {
        kind: "may",
        prompt: "Exile the historic permanent, returning it at the beginning of the next end step?",
        effect: {
          kind: "flicker",
          target: 0,
          returnAt: "next-end-step",
          returnText: "Return the exiled card to the battlefield under its owner's control.",
        },
      },
      resolve: null,
      text: ENTERS_TEXT,
    },
  ],
});
