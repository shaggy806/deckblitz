import { defineCard } from "../define.js";

// EDHREC rank 12553. Enduring Courage's "if it was a creature" return, as a land
// named Moon with a {C} ability; she stays legendary (the reminder), and as a
// land is no longer a creature (the ruling).

const DIES_TEXT =
  'When Princess Yue dies, if she was a nonland creature, return this card to the battlefield tapped under your control. She\'s a land named Moon. She gains "{T}: Add {C}." (She\'s still legendary.)';

export default defineCard({
  name: "Princess Yue",
  manaCost: "{2}{U}",
  colors: ["U"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Noble", "Ally"],
  power: 3,
  toughness: 2,
  text: `${DIES_TEXT}\n{T}: Scry 2.`,
  triggered: [
    {
      trigger: { on: "dies", who: "self" },
      condition: { kind: "source", filter: { type: "creature", notTypes: ["land"] } },
      targets: [],
      effect: {
        kind: "put-onto-battlefield",
        target: "trigger-object",
        enterTapped: true,
        underYourControl: true,
        enterAs: {
          setTypes: ["land"],
          name: "Moon",
          activated: [
            {
              cost: { mana: null, tap: true },
              targets: [],
              effect: { kind: "add-mana", mana: "C", amount: 1 },
              resolve: null,
              text: "{T}: Add {C}.",
            },
          ],
        },
      },
      resolve: null,
      text: DIES_TEXT,
    },
  ],
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: [],
      effect: { kind: "scry", amount: 2 },
      resolve: null,
      text: "{T}: Scry 2.",
    },
  ],
});
