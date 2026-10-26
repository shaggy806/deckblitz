import { defineCard } from "../define.js";

// Stronghold (STH). EDHREC rank 27162. The attack trigger's object is the
// enchanted creature, and the delayed ability keeps it (Aether Membrane's
// "that creature"); "this Aura" is the source. Both go back as one
// instruction, each only if it's still the same object on the battlefield.

const TEXT = "When enchanted creature attacks, return it and this Aura to their owners' hands at end of combat.";

export default defineCard({
  name: "Contempt",
  manaCost: "{1}{U}",
  colors: ["U"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  text: `Enchant creature\n${TEXT}`,
  targets: ["creature"],
  triggered: [
    {
      trigger: { on: "attacks", who: "attached" },
      targets: [],
      effect: {
        kind: "delayed-trigger",
        at: "end-of-combat",
        text: "Return it and this Aura to their owners' hands.",
        effect: {
          kind: "sequence",
          simultaneous: true,
          effects: [
            { kind: "return-to-hand", target: "trigger-object" },
            { kind: "return-to-hand", target: "source" },
          ],
        },
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
