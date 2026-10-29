import { defineCard } from "../define.js";

// Embiggen Fist grants a base-power-setting static until end of turn: once
// granted it isn't a characteristic-defining ability (rule 604.3a), so it
// applies in layer 7b at the grant's timestamp, live as the hand changes.

const FIST_TEXT =
  "Embiggen Fist — Whenever you cast a spell that targets a creature you control, draw a card. Until end of turn, Ms. Marvel gains \"Ms. Marvel's base power is equal to the number of cards in your hand.\"";

export default defineCard({
  name: "Ms. Marvel, Kamala Khan",
  manaCost: "{2}{U}",
  colors: ["U"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Mutant", "Inhuman", "Hero"],
  power: 1,
  toughness: 4,
  keywords: ["reach", "vigilance"],
  text: `Reach, vigilance\nYou have no maximum hand size.\n${FIST_TEXT}`,
  static: [{ affects: { scope: "self" }, noMaxHandSize: true, text: "You have no maximum hand size." }],
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
          { kind: "draw", amount: 1 },
          {
            kind: "grant-static",
            target: "source",
            ability: {
              affects: { scope: "self" },
              setBasePtFromCount: { countOf: "cards-in-your-hand", plusPower: 0, plusToughness: 0, only: "power" },
              text: "Ms. Marvel's base power is equal to the number of cards in your hand.",
            },
            duration: "end-of-turn",
          },
        ],
      },
      resolve: null,
      text: FIST_TEXT,
    },
  ],
});
