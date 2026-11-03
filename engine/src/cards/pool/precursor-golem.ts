import { defineCard } from "../define.js";

// Any one Golem targeted, by name of whichever Golem it is and whoever controls
// it (the rulings), even several times over: `single` says it's one. The caster
// makes the copies, and "other" is other than the Golem the spell targets.

const ENTER = "When this creature enters, create two 3/3 colorless Golem artifact creature tokens.";
const TEXT =
  "Whenever a player casts an instant or sorcery spell that targets only a single Golem, that player copies that spell for each other Golem that spell could target. Each copy targets a different one of those Golems.";

export default defineCard({
  name: "Precursor Golem",
  manaCost: "{5}",
  colors: [],
  types: ["artifact", "creature"],
  subtypes: ["Golem"],
  power: 3,
  toughness: 3,
  text: `${ENTER}\n${TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: { kind: "create-token", token: "Golem Token", count: 2 },
      resolve: null,
      text: ENTER,
    },
    {
      trigger: {
        on: "cast-spell",
        who: "any",
        filter: {
          typesAnyOf: ["instant", "sorcery"],
          targets: { only: true, single: true, permanent: { subtype: "Golem" } },
        },
      },
      targets: [],
      effect: {
        kind: "copy-spell",
        target: "trigger-spell",
        controller: "trigger-controller",
        forEachItCouldTarget: { filter: { subtype: "Golem" }, other: "targeted" },
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
