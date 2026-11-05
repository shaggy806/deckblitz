import { defineCard } from "../define.js";

// EDHREC rank 23194.

const TEXT =
  "When this creature enters, target opponent reveals their hand. You choose an artifact, instant, or sorcery card from it and exile that card.";

export default defineCard({
  name: "Nimble Larcenist",
  manaCost: "{W}{U}{B}",
  colors: ["W", "U", "B"],
  types: ["creature"],
  subtypes: ["Bird", "Rogue"],
  power: 2,
  toughness: 1,
  keywords: ["flying"],
  text: `Flying\n${TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: ["opponent"],
      effect: {
        kind: "discard-chosen",
        target: 0,
        filter: { typesAnyOf: ["artifact", "instant", "sorcery"] },
        destination: "exile",
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
