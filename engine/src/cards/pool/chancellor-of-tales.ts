import { defineCard } from "../define.js";

// Rulings:
//   [2023-09-01] Chancellor of Tales's ability and the copy it creates both resolve before the
//     Adventure spell. They resolve even if the Adventure spell is countered before the copy is
//     created.
//   [2023-09-01] An Adventure spell means an instant or sorcery spell with the Adventure spell
//     type. Permanent spells that you cast which have an Adventure won't cause this ability to
//     trigger.
//   [2023-09-01] The copy will have the same targets as the spell it's copying unless you choose
//     new ones.
//   [2023-09-01] The copy is created on the stack, so it's not "cast."
// "An Adventure spell" is the spell's Adventure subtype (Storyteller Pixie's filter); the copy is
// Swarm Intelligence's.

const TEXT = "Whenever you cast an Adventure spell, you may copy it. You may choose new targets for the copy.";

export default defineCard({
  name: "Chancellor of Tales",
  manaCost: "{3}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Faerie", "Advisor"],
  power: 2,
  toughness: 3,
  keywords: ["flying"],
  text: `Flying\n${TEXT}`,
  triggered: [
    {
      trigger: { on: "cast-spell", who: "you", filter: { subtype: "Adventure" } },
      targets: [],
      effect: {
        kind: "may",
        prompt: "Copy that Adventure spell?",
        effect: { kind: "copy-spell", target: "trigger-spell", newTargets: true },
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
