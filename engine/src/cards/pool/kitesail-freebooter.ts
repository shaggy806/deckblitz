import { defineCard } from "../define.js";

// Ixalan. "Until this creature leaves" is rule 610.3: the return is a one-shot
// effect, to the hand it came from, with no trigger (`untilSourceLeaves`).

const TEXT =
  "When this creature enters, target opponent reveals their hand. You choose a noncreature, nonland card from it. Exile that card until this creature leaves the battlefield.";

export default defineCard({
  name: "Kitesail Freebooter",
  manaCost: "{1}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Human", "Pirate"],
  power: 1,
  toughness: 2,
  keywords: ["flying"],
  text: `Flying\n${TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: ["opponent"],
      effect: {
        kind: "discard-chosen",
        target: 0,
        filter: { notTypes: ["creature", "land"] },
        destination: "exile",
        untilSourceLeaves: true,
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
