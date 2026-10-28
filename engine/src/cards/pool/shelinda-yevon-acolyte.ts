import { defineCard } from "../define.js";

// EDHREC rank 5447. Sage-Eye Avengers' compare, asked of the entering
// creature (as it last existed, if it has left) against Shelinda's power as
// the ability resolves.

const TEXT =
  "Whenever another creature you control enters, put a +1/+1 counter on that creature if its power is less than Shelinda's power. Otherwise, put a +1/+1 counter on Shelinda.";

export default defineCard({
  name: "Shelinda, Yevon Acolyte",
  manaCost: "{G}{W}",
  colors: ["G", "W"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Cleric"],
  power: 2,
  toughness: 2,
  keywords: ["lifelink"],
  text: `Lifelink\n${TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "you-control", filter: { type: "creature" }, otherOnly: true },
      targets: [],
      effect: {
        kind: "conditional",
        condition: {
          kind: "trigger-object",
          filter: { power: { op: "lt", n: { amount: { powerOf: "source" } } } },
        },
        then: { kind: "add-counter", target: "trigger-object", counter: "+1/+1", amount: 1 },
        else: { kind: "add-counter", target: "source", counter: "+1/+1", amount: 1 },
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
