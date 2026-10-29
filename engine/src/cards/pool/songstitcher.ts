import { defineCard } from "../define.js";

// EDHREC rank 29723.

export default defineCard({
  name: "Songstitcher",
  manaCost: "{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Human", "Cleric"],
  power: 1,
  toughness: 1,
  text: "{1}{W}: Prevent all combat damage that would be dealt this turn by target attacking creature with flying.",
  activated: [
    {
      cost: { mana: "{1}{W}", tap: false },
      targets: [{ kind: "permanent", filter: { attacking: true, type: "creature", keyword: "flying" } }],
      effect: { kind: "damage-rule", by: { target: 0 }, combat: true },
      resolve: null,
      text: "{1}{W}: Prevent all combat damage that would be dealt this turn by target attacking creature with flying.",
    },
  ],
});
