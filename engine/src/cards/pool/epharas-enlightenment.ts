import { defineCard } from "../define.js";

export default defineCard({
  name: "Ephara's Enlightenment",
  manaCost: "{1}{W}{U}",
  colors: ["W", "U"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  text: "Enchant creature\nWhen this Aura enters, put a +1/+1 counter on enchanted creature.\nEnchanted creature has flying.\nWhenever a creature you control enters, you may return this Aura to its owner's hand.",
  targets: ["creature"],
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: { kind: "add-counter", target: "attached", counter: "+1/+1", amount: 1 },
      resolve: null,
      text: "When this Aura enters, put a +1/+1 counter on enchanted creature.",
    },
    {
      trigger: { on: "enters-battlefield", who: "you-control", filter: { type: "creature" } },
      targets: [],
      effect: {
        kind: "may",
        prompt: "Return Ephara's Enlightenment to its owner's hand?",
        effect: { kind: "return-to-hand", target: "source" },
      },
      resolve: null,
      text: "Whenever a creature you control enters, you may return this Aura to its owner's hand.",
    },
  ],
  static: [
    {
      affects: { scope: "attached" },
      grantKeywords: ["flying"],
      text: "Enchanted creature has flying.",
    },
  ],
});
