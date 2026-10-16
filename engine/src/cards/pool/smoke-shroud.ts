import { defineCard } from "../define.js";

// EDHREC rank 7173.

export default defineCard({
  name: "Smoke Shroud",
  manaCost: "{1}{U}",
  colors: ["U"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  text: "Enchant creature\nEnchanted creature gets +1/+1 and has flying.\nWhen a Ninja you control enters, you may return this card from your graveyard to the battlefield attached to that creature.",
  targets: ["creature"],
  static: [
    {
      affects: { scope: "attached" },
      grantPt: [1, 1],
      grantKeywords: ["flying"],
      text: "Enchanted creature gets +1/+1 and has flying.",
    },
  ],
  triggered: [
    {
      // From the graveyard. "That creature" is the entering Ninja while it
      // is still the same object (rule 400.7); if it isn't, or Smoke Shroud
      // can't enchant it, Smoke Shroud stays in the graveyard (rule 303.4i).
      fromGraveyard: true,
      trigger: { on: "enters-battlefield", who: "you-control", filter: { subtype: "Ninja" } },
      targets: [],
      effect: {
        kind: "may",
        prompt: "Return Smoke Shroud from your graveyard to the battlefield attached to that creature?",
        effect: { kind: "put-onto-battlefield", target: "source", attachedTo: "trigger-object" },
      },
      resolve: null,
      text: "When a Ninja you control enters, you may return this card from your graveyard to the battlefield attached to that creature.",
    },
  ],
});
