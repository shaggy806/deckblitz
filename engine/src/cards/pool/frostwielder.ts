import { defineCard } from "../define.js";


export default defineCard({
  name: "Frostwielder",
  manaCost: "{2}{R}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Human", "Shaman"],
  power: 1,
  toughness: 2,
  text: "If a creature dealt damage by this creature this turn would die, exile it instead.\n{T}: This creature deals 1 damage to any target.",
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: ["any-target"],
      effect: { kind: "damage", amount: 1, target: 0 },
      resolve: null,
      text: "{T}: This creature deals 1 damage to any target.",
    },
  ],
  static: [
    {
      affects: { scope: "self" },
      replacement: {
        event: "would-be-put-into-graveyard",
        instead: "exile",
        from: "battlefield",
        filter: { type: "creature", damagedThisTurnBy: { source: "this" } },
      },
      text: "If a creature dealt damage by this creature this turn would die, exile it instead.",
    },
  ],
});
