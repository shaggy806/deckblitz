import { defineCard } from "../define.js";

export default defineCard({
  name: "Sorin, Lord of Innistrad",
  manaCost: "{2}{W}{B}",
  colors: ["W", "B"],
  supertypes: ["legendary"],
  types: ["planeswalker"],
  subtypes: ["Sorin"],
  loyalty: 3,
  text: '+1: Create a 1/1 black Vampire creature token with lifelink.\n−2: You get an emblem with "Creatures you control get +1/+0."\n−6: Destroy up to three target creatures and/or other planeswalkers. Return each card put into a graveyard this way to the battlefield under your control.',
  activated: [
    {
      loyaltyCost: 1,
      cost: { mana: null, tap: false },
      targets: [],
      effect: { kind: "create-token", token: "1/1 Lifelink Vampire Token", count: 1 },
      resolve: null,
      text: "+1: Create a 1/1 black Vampire creature token with lifelink.",
    },
    {
      loyaltyCost: -2,
      cost: { mana: null, tap: false },
      targets: [],
      effect: {
        kind: "create-emblem",
        text: "Creatures you control get +1/+0.",
        static: { affects: { scope: "creatures-you-control" }, grantPt: [1, 0], text: "Creatures you control get +1/+0." },
      },
      resolve: null,
      text: '−2: You get an emblem with "Creatures you control get +1/+0."',
    },
    {
      loyaltyCost: -6,
      cost: { mana: null, tap: false },
      targets: [
        {
          kind: "any-number",
          max: 3,
          of: { kind: "permanent", filter: { anyOf: [{ type: "creature" }, { type: "planeswalker", isSource: false }] } },
        },
      ],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "for-each-target", from: 0, simultaneous: true, effect: { kind: "destroy", target: 0 } },
          { kind: "return-from-graveyard", from: "all-graveyards", filter: { thisWay: "died" }, destination: "battlefield", count: "all" },
        ],
      },
      resolve: null,
      text: "−6: Destroy up to three target creatures and/or other planeswalkers. Return each card put into a graveyard this way to the battlefield under your control.",
    },
  ],
});
