import { defineCard } from "../define.js";

export default defineCard({
  name: "Initiate of Blood",
  manaCost: "{3}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Ogre", "Shaman"],
  power: 2,
  toughness: 2,
  text: "{T}: This creature deals 1 damage to target creature that was dealt damage this turn. When that creature dies this turn, flip this creature.",
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: [{ kind: "permanent", whose: "any", filter: { type: "creature", damagedThisTurnBy: {} } }],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "damage", amount: 1, target: 0 },
          {
            kind: "delayed-trigger",
            at: { leaves: 0, to: ["graveyard"], thisTurn: true },
            effect: { kind: "flip", target: "source" },
            text: "When that creature dies this turn, flip this creature.",
          },
        ],
      },
      resolve: null,
      text: "{T}: This creature deals 1 damage to target creature that was dealt damage this turn. When that creature dies this turn, flip this creature.",
    },
  ],
  faces: ["Initiate of Blood", "Goka the Unjust"],
  flip: true,
});
