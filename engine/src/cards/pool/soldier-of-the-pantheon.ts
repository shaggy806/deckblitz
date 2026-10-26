import { defineCard } from "../define.js";

const LIFE = "Whenever an opponent casts a multicolored spell, you gain 1 life.";

export default defineCard({
  name: "Soldier of the Pantheon",
  manaCost: "{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Human", "Soldier"],
  power: 2,
  toughness: 1,
  text: `Protection from multicolored\n${LIFE}`,
  static: [
    {
      affects: { scope: "self" },
      protection: { filter: { multicolored: true } },
      text: "Protection from multicolored",
    },
  ],
  triggered: [
    {
      trigger: { on: "cast-spell", who: "opponent", filter: { multicolored: true } },
      targets: [],
      effect: { kind: "gain-life", amount: 1 },
      resolve: null,
      text: LIFE,
    },
  ],
});
