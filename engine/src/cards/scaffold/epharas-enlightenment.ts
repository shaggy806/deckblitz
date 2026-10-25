import { defineCard } from "../define.js";

// SCAFFOLD — written by `npm run card:scaffold` from the Oracle snapshot. Not in the
// registry: author each TODO(scaffold), move this file into cards/pool/ (or
// tokens/), then run `npm run gen:cards -w engine`. See cards/AUTHORING.md.
// EDHREC rank 23475.
//
// Rulings:
//   [2014-02-01] The last ability of Ephara's Enlightenment will trigger only if it's on the
//     battlefield when the creature enters the battlefield under your control. You may return it
//     to its owner's hand only if it's still on the battlefield when that ability resolves.
//   [2014-02-01] If Ephara's Enlightenment isn't on the battlefield when its
//     enters-the-battlefield ability resolves, put a +1/+1 counter on the creature it was
//     enchanting when it left the battlefield.

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
      effect: null,
      resolve: null,
      text: "When this Aura enters, put a +1/+1 counter on enchanted creature.",
      // TODO(scaffold): Put a +1/+1 counter on enchanted creature.
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
