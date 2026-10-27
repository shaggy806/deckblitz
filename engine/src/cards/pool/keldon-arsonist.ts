import { defineCard } from "../define.js";

// Prophecy (PCY). EDHREC rank 29495. Sai, Master Thopterist's two-permanent
// sacrifice cost.

const TEXT = "{1}, Sacrifice two lands: Destroy target land.";

export default defineCard({
  name: "Keldon Arsonist",
  manaCost: "{2}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Human", "Soldier"],
  power: 1,
  toughness: 1,
  text: TEXT,
  activated: [
    {
      cost: { mana: "{1}", tap: false, sacrifice: { filter: { type: "land" }, count: 2 } },
      targets: ["land"],
      effect: { kind: "destroy", target: 0 },
      resolve: null,
      text: TEXT,
    },
  ],
});
