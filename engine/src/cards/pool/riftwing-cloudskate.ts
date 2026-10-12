import { defineCard } from "../define.js";

export default defineCard({
  name: "Riftwing Cloudskate",
  manaCost: "{3}{U}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Illusion"],
  power: 2,
  toughness: 2,
  keywords: ["flying"],
  suspend: { n: 3, cost: "{1}{U}" },
  text: "Flying\nWhen this creature enters, return target permanent to its owner's hand.\nSuspend 3—{1}{U} (Rather than cast this card from your hand, you may pay {1}{U} and exile it with three time counters on it. At the beginning of your upkeep, remove a time counter. When the last is removed, you may cast it without paying its mana cost. It has haste.)",
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: ["permanent"],
      effect: { kind: "return-to-hand", target: 0 },
      resolve: null,
      text: "When this creature enters, return target permanent to its owner's hand.",
    },
  ],
});
