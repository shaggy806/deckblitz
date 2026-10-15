import { defineCard } from "../define.js";

// EDHREC rank 29431.
//
// Once per spell however many such targets it has (the ruling); the trigger
// resolves first, so it gets its counter even if the spell is countered.

const COUNTER_TEXT =
  "Whenever you cast a spell that targets an opponent or a creature an opponent controls, put a +1/+1 counter on Danitha.";

export default defineCard({
  name: "Danitha, Spear of Agony",
  manaCost: "{2}{B}",
  colors: ["B"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Knight"],
  power: 2,
  toughness: 2,
  keywords: ["first-strike"],
  text: `First strike\n${COUNTER_TEXT}`,
  triggered: [
    {
      trigger: {
        on: "cast-spell",
        who: "you",
        filter: {
          anyOf: [
            { targets: { player: "opponent" } },
            { targets: { permanent: { type: "creature", controlledBy: "opponent" } } },
          ],
        },
      },
      targets: [],
      effect: { kind: "add-counter", target: "source", counter: "+1/+1", amount: 1 },
      resolve: null,
      text: COUNTER_TEXT,
    },
  ],
});
