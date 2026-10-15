import { defineCard } from "../define.js";

// EDHREC rank 20257. Hawkeye, Bowslinger's trigger, narrowed to a creature
// you control (Season of Growth's filter): the spell may target other things
// too.
const CAST_TEXT =
  "Whenever you cast a spell that targets a creature you control, put a +1/+1 counter on Colleen Wing. Scry 1.";

export default defineCard({
  name: "Colleen Wing, Street Samurai",
  manaCost: "{1}{W}",
  colors: ["W"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Samurai", "Hero"],
  power: 2,
  toughness: 2,
  text: `${CAST_TEXT} (Look at the top card of your library. You may put that card on the bottom.)`,
  triggered: [
    {
      trigger: {
        on: "cast-spell",
        who: "you",
        filter: { targets: { permanent: { type: "creature", controlledBy: "you" } } },
      },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "add-counter", target: "source", counter: "+1/+1", amount: 1 },
          { kind: "scry", amount: 1 },
        ],
      },
      resolve: null,
      text: CAST_TEXT,
    },
  ],
});
