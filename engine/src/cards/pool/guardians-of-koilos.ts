import { defineCard } from "../define.js";

// EDHREC rank 23165. Stockpiling Celebrant's targeted "you may return another
// target … you control": the target is chosen as it triggers, the "may" asked
// as it resolves.

const TEXT = "When this creature enters, you may return another target historic permanent you control to its owner's hand.";

export default defineCard({
  name: "Guardians of Koilos",
  manaCost: "{5}",
  colors: [],
  types: ["artifact", "creature"],
  subtypes: ["Construct"],
  power: 4,
  toughness: 4,
  text: `${TEXT} (Artifacts, legendaries, and Sagas are historic.)`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [
        {
          kind: "other",
          of: {
            kind: "permanent",
            whose: "you",
            filter: { anyOf: [{ type: "artifact" }, { supertype: "legendary" }, { subtype: "Saga" }] },
          },
        },
      ],
      effect: {
        kind: "may",
        prompt: "Return the targeted historic permanent to its owner's hand?",
        effect: { kind: "return-to-hand", target: 0 },
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
