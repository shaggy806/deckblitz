import { defineCard } from "../define.js";


export default defineCard({
  name: "Incendiary Oracle",
  manaCost: "{1}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Human", "Shaman"],
  power: 2,
  toughness: 2,
  text: "{1}{R}: This creature gets +1/+0 until end of turn.\nIf a creature dealt damage by this creature this turn would die, exile it instead.",
  activated: [
    {
      cost: { mana: "{1}{R}", tap: false },
      targets: [],
      effect: { kind: "modify-pt", target: "source", power: 1, toughness: 0, duration: "end-of-turn" },
      resolve: null,
      text: "{1}{R}: This creature gets +1/+0 until end of turn.",
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
