import { defineCard } from "../define.js";

const ENTER =
  "When Lobelia enters, exile target creature card from an opponent's graveyard that was put there from the battlefield this turn, then create X Treasure tokens, where X is the exiled card's power.";

export default defineCard({
  name: "Lobelia Sackville-Baggins",
  manaCost: "{2}{B}",
  colors: ["B"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Halfling", "Citizen"],
  power: 2,
  toughness: 3,
  keywords: ["flash", "menace"],
  text: `Flash\nMenace\n${ENTER}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [
        {
          kind: "card-in-graveyard",
          whose: "opponent",
          filter: { type: "creature", putIntoGraveyardThisTurn: { from: ["battlefield"] } },
        },
      ],
      // X is the card's power as it last existed in the graveyard (the ruling).
      effect: {
        kind: "sequence",
        effects: [
          { kind: "exile", target: 0 },
          { kind: "create-token", token: "Treasure Token", count: { powerOf: 0 } },
        ],
      },
      resolve: null,
      text: ENTER,
    },
  ],
});
