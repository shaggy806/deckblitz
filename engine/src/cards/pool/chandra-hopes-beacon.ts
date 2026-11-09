import { defineCard } from "../define.js";

export default defineCard({
  name: "Chandra, Hope's Beacon",
  manaCost: "{4}{R}{R}",
  colors: ["R"],
  supertypes: ["legendary"],
  types: ["planeswalker"],
  subtypes: ["Chandra"],
  loyalty: 5,
  text: "Whenever you cast an instant or sorcery spell, copy it. You may choose new targets for the copy. This ability triggers only once each turn.\n+2: Add two mana in any combination of colors.\n+1: Exile the top five cards of your library. Until the end of your next turn, you may cast an instant or sorcery spell from among those exiled cards.\n−X: Chandra deals X damage to each of up to two targets.",
  triggered: [
    {
      trigger: { on: "cast-spell", who: "you", filter: { typesAnyOf: ["instant", "sorcery"] } },
      oncePerTurn: true,
      targets: [],
      effect: { kind: "copy-spell", target: "trigger-spell", newTargets: true },
      resolve: null,
      text: "Whenever you cast an instant or sorcery spell, copy it. You may choose new targets for the copy. This ability triggers only once each turn.",
    },
  ],
  activated: [
    {
      loyaltyCost: 2,
      cost: { mana: null, tap: false },
      targets: [],
      effect: { kind: "add-mana", mana: { oneOf: ["W", "U", "B", "R", "G"] }, amount: 2 },
      resolve: null,
      text: "+2: Add two mana in any combination of colors.",
    },
    {
      loyaltyCost: 1,
      cost: { mana: null, tap: false },
      targets: [],
      effect: {
        kind: "impulse-exile",
        amount: 5,
        duration: "until-end-of-your-next-turn",
        spell: { typesAnyOf: ["instant", "sorcery"] },
        upTo: 1,
      },
      resolve: null,
      text: "+1: Exile the top five cards of your library. Until the end of your next turn, you may cast an instant or sorcery spell from among those exiled cards.",
    },
    {
      loyaltyCost: "-x",
      cost: { mana: null, tap: false },
      targets: [
        { kind: "optional", of: "any-target" },
        { kind: "optional", of: { kind: "other", of: "any-target", than: { slots: [0] } } },
      ],
      effect: {
        kind: "sequence",
        simultaneous: true,
        effects: [
          { kind: "damage", amount: "x", target: 0 },
          { kind: "damage", amount: "x", target: 1 },
        ],
      },
      resolve: null,
      text: "−X: Chandra deals X damage to each of up to two targets.",
    },
  ],
});
