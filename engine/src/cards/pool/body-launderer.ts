import { defineCard } from "../define.js";

// Streets of New Capenna. The dies trigger's power limit is Body Launderer's
// power as it last existed on the battlefield (its ruling), read through the
// trigger object.
const CONNIVE_TEXT = "Whenever another nontoken creature you control dies, this creature connives.";
const DIES_TEXT =
  "When this creature dies, return another target non-Rogue creature card with equal or lesser power from your graveyard to the battlefield.";

export default defineCard({
  name: "Body Launderer",
  manaCost: "{2}{B}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Ogre", "Rogue"],
  power: 3,
  toughness: 3,
  keywords: ["deathtouch"],
  text: `Deathtouch\n${CONNIVE_TEXT}\n${DIES_TEXT}`,
  triggered: [
    {
      trigger: { on: "dies", who: "you-control", filter: { token: false, type: "creature" }, otherOnly: true },
      targets: [],
      effect: { kind: "connive", target: "source" },
      resolve: null,
      text: CONNIVE_TEXT,
    },
    {
      trigger: { on: "dies", who: "self" },
      targets: [
        {
          kind: "other",
          of: {
            kind: "card-in-graveyard",
            whose: "you",
            filter: {
              type: "creature",
              notSubtypes: ["Rogue"],
              power: { op: "lte", n: { amount: { powerOf: "trigger-object" } } },
            },
          },
          than: "source",
        },
      ],
      effect: { kind: "put-onto-battlefield", target: 0 },
      resolve: null,
      text: DIES_TEXT,
    },
  ],
});
