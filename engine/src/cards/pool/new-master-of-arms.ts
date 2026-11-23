import { defineCard } from "../define.js";

export default defineCard({
  name: "New Master of Arms",
  manaCost: "{2}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Human", "Soldier"],
  power: 2,
  toughness: 2,
  keywords: ["first-strike"],
  text: "First strike\nPrevent all combat damage that would be dealt by blocking creatures that are tapped.\n{1}{W}: Tap target creature blocking New Master of Arms.",
  static: [
    {
      affects: { scope: "self" },
      replacement: {
        event: "would-deal-damage",
        combat: true,
        source: { type: "creature", blocking: true, tapped: true },
        instead: { prevent: true },
      },
      text: "Prevent all combat damage that would be dealt by blocking creatures that are tapped.",
    },
  ],
  activated: [
    {
      cost: { mana: "{1}{W}", tap: false },
      targets: [{ kind: "permanent", filter: { type: "creature", blockingRelation: { relation: "blocking" } } }],
      effect: { kind: "tap", target: 0 },
      resolve: null,
      text: "{1}{W}: Tap target creature blocking New Master of Arms.",
    },
  ],
});
