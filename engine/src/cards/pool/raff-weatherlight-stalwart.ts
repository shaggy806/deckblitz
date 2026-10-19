import { defineCard } from "../define.js";

// Dominaria United (DMU). EDHREC rank 13301.
//
// Aziza, Mage Tower Captain's shape: "you may tap two untapped creatures you
// control" is offered only while you control two (Raff among them — it isn't
// a {T} cost, so summoning sickness doesn't matter), and exactly two are
// tapped before the draw. The trigger resolves before the spell, even if that
// spell is countered (the ruling).
const UNTAPPED_CREATURE = { type: "creature", tapped: false, controlledBy: "you" } as const;
const CAST_TEXT =
  "Whenever you cast an instant or sorcery spell, you may tap two untapped creatures you control. If you do, draw a card.";
const PUMP_TEXT = "{3}{W}{W}: Creatures you control get +1/+1 and gain vigilance until end of turn.";

export default defineCard({
  name: "Raff, Weatherlight Stalwart",
  manaCost: "{W}{U}",
  colors: ["W", "U"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Wizard"],
  power: 1,
  toughness: 3,
  text: `${CAST_TEXT}\n${PUMP_TEXT}`,
  activated: [
    {
      cost: { mana: "{3}{W}{W}", tap: false },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          {
            kind: "modify-pt-all",
            filter: { type: "creature", controlledBy: "you" },
            power: 1,
            toughness: 1,
            duration: "end-of-turn",
          },
          {
            kind: "grant-keyword-all",
            filter: { type: "creature", controlledBy: "you" },
            keyword: "vigilance",
            duration: "end-of-turn",
          },
        ],
      },
      resolve: null,
      text: PUMP_TEXT,
    },
  ],
  triggered: [
    {
      trigger: { on: "cast-spell", who: "you", filter: { typesAnyOf: ["instant", "sorcery"] } },
      targets: [],
      effect: {
        kind: "conditional",
        condition: { kind: "controls", filter: UNTAPPED_CREATURE, atLeast: 2 },
        then: {
          kind: "may",
          prompt: "Tap two untapped creatures you control to draw a card?",
          effect: {
            kind: "sequence",
            effects: [
              {
                kind: "choose-permanents",
                filter: UNTAPPED_CREATURE,
                min: 2,
                upTo: 2,
                then: { kind: "tap", target: 0 },
                prompt: "Tap two untapped creatures you control",
              },
              { kind: "draw", amount: 1 },
            ],
          },
        },
      },
      resolve: null,
      text: CAST_TEXT,
    },
  ],
});
