import { defineCard } from "../define.js";

// Horobi, Death's Wail's shape: any creature becoming a target, by anyone.

const TEXT =
  "Whenever a creature becomes the target of a spell or ability, return that creature to its owner's hand. (It won't be affected by the spell or ability.)";

export default defineCard({
  name: "Cowardice",
  manaCost: "{3}{U}{U}",
  colors: ["U"],
  types: ["enchantment"],
  text: TEXT,
  triggered: [
    {
      trigger: { on: "becomes-target", who: "any", filter: { type: "creature" } },
      targets: [],
      effect: { kind: "return-to-hand", target: "trigger-object" },
      resolve: null,
      text: TEXT,
    },
  ],
});
