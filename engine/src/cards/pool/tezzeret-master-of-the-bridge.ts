import { defineCard } from "../define.js";

// Top-5000 #3214.
const AFFINITY_TEXT =
  "Creature and planeswalker spells you cast have affinity for artifacts. (They cost {1} less to cast for each artifact you control.)";
const PLUS_TEXT = "+2: Tezzeret deals X damage to each opponent, where X is the number of artifacts you control. You gain X life.";
const MINUS_TEXT = "−3: Return target artifact card from your graveyard to your hand.";
const ULT_TEXT = "−8: Exile the top ten cards of your library. Put all artifact cards from among them onto the battlefield.";

const ARTIFACTS = { countOf: { type: "artifact", controlledBy: "you" } } as const;

export default defineCard({
  name: "Tezzeret, Master of the Bridge",
  manaCost: "{4}{U}{B}",
  colors: ["U", "B"],
  supertypes: ["legendary"],
  types: ["planeswalker"],
  subtypes: ["Tezzeret"],
  loyalty: 5,
  text: `${AFFINITY_TEXT}\n${PLUS_TEXT}\n${MINUS_TEXT}\n${ULT_TEXT}`,
  static: [
    {
      affects: { scope: "self" },
      costModification: {
        applies: { typesAnyOf: ["creature", "planeswalker"] },
        reduceGeneric: { countOf: { type: "artifact", controlledBy: "you" } },
        when: { caster: "you" },
      },
      text: AFFINITY_TEXT,
    },
  ],
  activated: [
    {
      loyaltyCost: 2,
      cost: { mana: null, tap: false },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "damage", amount: ARTIFACTS, who: "each-opponent" },
          { kind: "gain-life", amount: ARTIFACTS },
        ],
      },
      resolve: null,
      text: PLUS_TEXT,
    },
    {
      loyaltyCost: -3,
      cost: { mana: null, tap: false },
      targets: [{ kind: "card-in-graveyard", whose: "you", filter: { type: "artifact" } }],
      effect: { kind: "return-to-hand", target: 0, from: "graveyard" },
      resolve: null,
      text: MINUS_TEXT,
    },
    {
      loyaltyCost: -8,
      cost: { mana: null, tap: false },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "exile-from-library", amount: 10 },
          {
            kind: "look-and-choose",
            zone: "exile",
            min: 10,
            max: 10,
            filter: { thisWay: "exiled", type: "artifact" },
            destination: "battlefield",
            leftover: "stay",
          },
        ],
      },
      resolve: null,
      text: ULT_TEXT,
    },
  ],
});
