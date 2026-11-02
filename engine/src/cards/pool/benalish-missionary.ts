import { defineCard } from "../define.js";

export default defineCard({
  name: "Benalish Missionary",
  manaCost: "{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Human", "Cleric"],
  power: 1,
  toughness: 1,
  text: "{1}{W}, {T}: Prevent all combat damage that would be dealt by target blocked creature this turn.",
  activated: [
    {
      cost: { mana: "{1}{W}", tap: true },
      targets: [{ kind: "permanent", filter: { type: "creature", blocked: true } }],
      effect: { kind: "damage-rule", by: { target: 0 }, combat: true },
      resolve: null,
      text: "{1}{W}, {T}: Prevent all combat damage that would be dealt by target blocked creature this turn.",
    },
  ],
});
