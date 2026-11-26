import { defineCard } from "../define.js";

// Tempest. EDHREC rank 31550.
//
// An Aura spell is the spell as it is on the stack (`spellFilter`), whoever
// controls it; never an ability.

const TEXT = "Whenever this creature becomes the target of an Aura spell, you draw a card.";

export default defineCard({
  name: "Fugitive Druid",
  manaCost: "{3}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Human", "Druid"],
  power: 3,
  toughness: 2,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "becomes-target", who: "self", spellFilter: { subtype: "Aura" } },
      targets: [],
      effect: { kind: "draw", amount: 1 },
      resolve: null,
      text: TEXT,
    },
  ],
});
