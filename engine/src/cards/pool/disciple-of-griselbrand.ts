import { defineCard } from "../define.js";

// EDHREC rank 12335. The toughness is the sacrificed creature's as it last
// existed on the battlefield (its ruling).

const TEXT = "{1}, Sacrifice a creature: You gain life equal to the sacrificed creature's toughness.";

export default defineCard({
  name: "Disciple of Griselbrand",
  manaCost: "{1}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Human", "Cleric"],
  power: 1,
  toughness: 1,
  text: TEXT,
  activated: [
    {
      cost: { mana: "{1}", tap: false, sacrifice: "creature-you-control" },
      targets: [],
      effect: { kind: "gain-life", amount: { toughnessOf: "sacrificed" } },
      resolve: null,
      text: TEXT,
    },
  ],
});
