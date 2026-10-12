import { defineCard } from "../define.js";

export default defineCard({
  name: "Dwarven Miner",
  manaCost: "{1}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Dwarf"],
  power: 1,
  toughness: 2,
  text: "{2}{R}, {T}: Destroy target nonbasic land.",
  activated: [
    {
      cost: { mana: "{2}{R}", tap: true },
      targets: [{ kind: "permanent", filter: { notSupertype: "basic", type: "land" } }],
      effect: { kind: "destroy", target: 0 },
      resolve: null,
      text: "{2}{R}, {T}: Destroy target nonbasic land.",
    },
  ],
});
