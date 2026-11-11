import { defineCard } from "../define.js";

// "Isn't a creature" removes the type and the creature types that went with
// it (rule 205.1a — its ruling: still an artifact, no longer an Alien Angel).
// The combat damage it would deal to a creature is prevented, and then that
// creature's owner shuffles it into their library (rule 615.5).
export default defineCard({
  name: "Weeping Angel",
  manaCost: "{1}{U}{B}",
  colors: ["U", "B"],
  types: ["artifact", "creature"],
  subtypes: ["Alien", "Angel"],
  power: 2,
  toughness: 2,
  keywords: ["flash", "first-strike", "vigilance"],
  text:
    "Flash\n" +
    "First strike, vigilance\n" +
    "Whenever an opponent casts a creature spell, this creature isn't a creature until end of turn.\n" +
    "If this creature would deal combat damage to a creature, prevent that damage and that creature's owner shuffles it into their library.",
  triggered: [
    {
      trigger: { on: "cast-spell", who: "opponent", filter: { type: "creature" } },
      targets: [],
      effect: { kind: "become", target: "source", removeTypes: ["creature"], duration: "end-of-turn" },
      resolve: null,
      text: "Whenever an opponent casts a creature spell, this creature isn't a creature until end of turn.",
    },
  ],
  static: [
    {
      affects: { scope: "self" },
      replacement: {
        event: "would-deal-damage",
        fromSelf: true,
        combat: true,
        toFilter: { type: "creature" },
        instead: { prevent: true, then: { kind: "shuffle-into-library", target: "trigger-recipient" } },
      },
      text: "If this creature would deal combat damage to a creature, prevent that damage and that creature's owner shuffles it into their library.",
    },
  ],
});
