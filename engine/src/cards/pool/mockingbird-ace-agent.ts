import { defineCard } from "../define.js";

const CAST_TEXT =
  "Whenever you cast a spell that targets a creature you control, put a +1/+1 counter on Mockingbird.";

export default defineCard({
  name: "Mockingbird, Ace Agent",
  manaCost: "{3}{W}",
  colors: ["W"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Spy", "Hero"],
  power: 2,
  toughness: 2,
  keywords: ["double-strike"],
  text: `Double strike\n${CAST_TEXT}`,
  triggered: [
    {
      trigger: {
        on: "cast-spell",
        who: "you",
        filter: { targets: { permanent: { type: "creature", controlledBy: "you" } } },
      },
      targets: [],
      effect: { kind: "add-counter", target: "source", counter: "+1/+1", amount: 1 },
      resolve: null,
      text: CAST_TEXT,
    },
  ],
});
