import { ward } from "../helpers.js";
import { defineCard } from "../define.js";

// "That creature" is the one exiled, read as it last existed (rule 608.2h). If the
// Aura has left by the time this resolves, neither happens (rule 610.3 and its
// "until": nothing to last). Other than enchanted creature: the Aura's host.
const ENTERS_TEXT =
  "When this Aura enters, exile up to one target creature other than enchanted creature until this Aura leaves the battlefield. Enchanted creature becomes a copy of that creature until this Aura leaves the battlefield.";
const WARD_TEXT = "Enchanted creature has ward {2}.";

export default defineCard({
  name: "Secret Invasion",
  manaCost: "{1}{U}{U}",
  colors: ["U"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  targets: ["creature-you-control"],
  text: `Enchant creature you control\n${ENTERS_TEXT}\n${WARD_TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [
        {
          kind: "optional",
          of: { kind: "permanent", filter: { type: "creature", not: { attachments: { filter: { isSource: true } } } } },
        },
      ],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "exile", target: 0, untilSourceLeaves: true },
          { kind: "become-copy", target: "attached", of: 0, until: "while-source" },
        ],
      },
      resolve: null,
      text: ENTERS_TEXT,
    },
  ],
  static: [
    {
      affects: { scope: "attached" },
      grantsTriggered: [ward({ mana: "{2}" })],
      text: WARD_TEXT,
    },
  ],
});
