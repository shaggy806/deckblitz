import { defineCard } from "../define.js";

const DIES_TEXT = "When this creature dies, exile it and each player returns all creature cards from their graveyard to their hand.";

export default defineCard({
  name: "Underworld Cerberus",
  manaCost: "{3}{B}{R}",
  colors: ["B", "R"],
  types: ["creature"],
  subtypes: ["Dog"],
  power: 6,
  toughness: 6,
  text: `This creature can't be blocked except by three or more creatures.\nCards in graveyards can't be the targets of spells or abilities.\n${DIES_TEXT}`,
  triggered: [
    {
      trigger: { on: "dies", who: "self" },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "exile", target: "trigger-object" },
          {
            kind: "for-each-player",
            who: "each-player",
            effect: {
              kind: "look-and-choose",
              zone: "graveyard",
              player: "that-player",
              filter: { type: "creature" },
              min: { countInGraveyard: { type: "creature" } },
              max: { countInGraveyard: { type: "creature" } },
              destination: "hand",
              leftover: "stay",
            },
          },
        ],
      },
      resolve: null,
      text: DIES_TEXT,
    },
  ],
  static: [
    {
      affects: { scope: "self" },
      restrictions: [{ kind: "cant-be-blocked", byFewerThan: 3 }],
      text: "This creature can't be blocked except by three or more creatures.",
    },
    {
      affects: { scope: "self" },
      prohibits: [{ act: "be-targeted", object: { inZone: "graveyard" } }],
      text: "Cards in graveyards can't be the targets of spells or abilities.",
    },
  ],
});
