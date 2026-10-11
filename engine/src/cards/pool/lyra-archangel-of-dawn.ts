import { defineCard } from "../define.js";

export default defineCard({
  name: "Lyra, Archangel of Dawn",
  manaCost: "{2}{W}",
  colors: ["W"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Angel", "Knight"],
  power: 3,
  toughness: 3,
  keywords: ["flying"],
  text: "Flying\nWhenever you gain life, put a +1/+1 counter on each Angel you control.",
  triggered: [
    {
      trigger: { on: "gains-life", who: "you" },
      targets: [],
      effect: {
        kind: "add-counter-all",
        // "Each Angel": any Angel permanent, a Kindred one included.
        filter: { subtype: "Angel", controlledBy: "you" },
        counter: "+1/+1",
        amount: 1,
      },
      resolve: null,
      text: "Whenever you gain life, put a +1/+1 counter on each Angel you control.",
    },
  ],
});
