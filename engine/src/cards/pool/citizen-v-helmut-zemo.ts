import { defineCard } from "../define.js";

// EDHREC rank 19678.
// "Each Villain you control" is every permanent of that type, not only
// creatures (a kindred Villain counts too).

const TEXT = "Whenever you gain life, put a +1/+1 counter on each Villain you control.";

export default defineCard({
  name: "Citizen V, Helmut Zemo",
  manaCost: "{2}{B}",
  colors: ["B"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Noble", "Villain"],
  power: 2,
  toughness: 2,
  keywords: ["lifelink"],
  text: `Lifelink\n${TEXT}`,
  triggered: [
    {
      trigger: { on: "gains-life", who: "you" },
      targets: [],
      effect: {
        kind: "add-counter-all",
        filter: { subtype: "Villain", controlledBy: "you" },
        counter: "+1/+1",
        amount: 1,
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
