import { defineCard } from "../define.js";


export default defineCard({
  name: "Kumano, Master Yamabushi",
  manaCost: "{3}{R}{R}",
  colors: ["R"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Shaman"],
  power: 4,
  toughness: 4,
  text: "{1}{R}: Kumano deals 1 damage to any target.\nIf a creature dealt damage by Kumano this turn would die, exile it instead.",
  activated: [
    {
      cost: { mana: "{1}{R}", tap: false },
      targets: ["any-target"],
      effect: { kind: "damage", amount: 1, target: 0 },
      resolve: null,
      text: "{1}{R}: Kumano deals 1 damage to any target.",
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
      text: "If a creature dealt damage by Kumano this turn would die, exile it instead.",
    },
  ],
});
