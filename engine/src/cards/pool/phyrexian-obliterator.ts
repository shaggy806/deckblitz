import { defineCard } from "../define.js";

// New Phyrexia (NPH). EDHREC rank 1882.
//
// "That many" is the damage dealt, the trigger's value (Belltower Sphinx's
// shape); its controller sacrifices that many permanents of their choice.
export default defineCard({
  name: "Phyrexian Obliterator",
  manaCost: "{B}{B}{B}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Phyrexian", "Horror"],
  power: 5,
  toughness: 5,
  keywords: ["trample"],
  text: "Trample\nWhenever a source deals damage to this creature, that source's controller sacrifices that many permanents of their choice.",
  triggered: [
    {
      trigger: { on: "deals-damage", who: "any", to: "self" },
      targets: [],
      effect: { kind: "sacrifice", who: "trigger-controller", filter: {}, count: { triggerValue: true } },
      resolve: null,
      text: "Whenever a source deals damage to this creature, that source's controller sacrifices that many permanents of their choice.",
    },
  ],
});
