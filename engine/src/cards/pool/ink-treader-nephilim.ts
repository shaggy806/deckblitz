import { defineCard } from "../define.js";

// An intervening-if, unlike Zada's "that targets": asked again as it resolves
// (rule 603.4), so a spell retargeted in response makes no copies. The copies are
// this creature's controller's, for every creature the spell could target as its
// caster cast it (the ruling); one its controller couldn't target doesn't resolve.

const TEXT =
  "Whenever a player casts an instant or sorcery spell, if that spell targets only this creature, copy the spell for each other creature that spell could target. Each copy targets a different one of those creatures.";

const ONLY_THIS = { targets: { only: true, source: true } } as const;

export default defineCard({
  name: "Ink-Treader Nephilim",
  manaCost: "{R}{G}{W}{U}",
  colors: ["R", "G", "W", "U"],
  types: ["creature"],
  subtypes: ["Nephilim"],
  power: 3,
  toughness: 3,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "cast-spell", who: "any", filter: { typesAnyOf: ["instant", "sorcery"] } },
      condition: { kind: "trigger-object", filter: ONLY_THIS },
      targets: [],
      effect: {
        kind: "copy-spell",
        target: "trigger-spell",
        forEachItCouldTarget: { filter: { type: "creature" }, other: true },
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
