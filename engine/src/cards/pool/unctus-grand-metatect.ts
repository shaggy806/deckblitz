import { defineCard } from "../define.js";

// EDHREC rank 3891. "Other blue creatures you control" reads their colours as
// they are now (layer 5), so a creature its own ability made blue gets the
// looting trigger too.

const LOOT = "Whenever this creature becomes tapped, draw a card, then discard a card.";

export default defineCard({
  name: "Unctus, Grand Metatect",
  manaCost: "{1}{U}{U}",
  colors: ["U"],
  supertypes: ["legendary"],
  types: ["artifact", "creature"],
  subtypes: ["Phyrexian", "Vedalken"],
  power: 2,
  toughness: 4,
  text: `Other blue creatures you control have "${LOOT}"\nOther artifact creatures you control get +1/+1.\n{U/P}: Until end of turn, target creature you control becomes a blue artifact in addition to its other colors and types. Activate only as a sorcery. ({U/P} can be paid with either {U} or 2 life.)`,
  static: [
    {
      affects: { scope: "filter", filter: { type: "creature", colors: ["U"], controlledBy: "you" }, excludeSelf: true },
      grantsTriggered: [
        {
          trigger: { on: "becomes-tapped", who: "self" },
          targets: [],
          effect: {
            kind: "sequence",
            effects: [
              { kind: "draw", amount: 1 },
              { kind: "discard", target: "you", amount: 1 },
            ],
          },
          resolve: null,
          text: LOOT,
        },
      ],
      text: `Other blue creatures you control have "${LOOT}"`,
    },
    {
      affects: { scope: "filter", filter: { types: ["artifact", "creature"], controlledBy: "you" }, excludeSelf: true },
      grantPt: [1, 1],
      text: "Other artifact creatures you control get +1/+1.",
    },
  ],
  activated: [
    {
      cost: { mana: "{U/P}", tap: false },
      targets: ["creature-you-control"],
      effect: { kind: "add-types", target: 0, addTypes: ["artifact"], addColors: ["U"], duration: "end-of-turn" },
      resolve: null,
      sorcerySpeed: true,
      text: "{U/P}: Until end of turn, target creature you control becomes a blue artifact in addition to its other colors and types. Activate only as a sorcery.",
    },
  ],
});
