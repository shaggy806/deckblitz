import { defineCard } from "../define.js";

// EDHREC rank 23198.
//
// Kishla Trawlers' shape: "you may exile one or more creature cards from your
// graveyard" is a choice of none or any number of them, and "when you do" a
// reflexive trigger (rule 603.12) only once at least one was exiled. X is the
// number exiled — known as the reflexive ability triggers (Tip the Scales'
// `value`), so players respond knowing it. "Each other creature" spares the
// Specter, and is the set of creatures as that ability resolves (rule
// 611.2c).

const TEXT =
  "When this creature enters, you may exile one or more creature cards from your graveyard. When you do, each other creature gets -X/-X until end of turn, where X is the number of cards exiled this way.";

export default defineCard({
  name: "Specter of Mortality",
  manaCost: "{3}{B}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Specter"],
  power: 3,
  toughness: 3,
  keywords: ["flying"],
  text: `Flying\n${TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          {
            kind: "look-and-choose",
            zone: "graveyard",
            filter: { type: "creature" },
            min: 0,
            max: { graveyardSize: "you" },
            destination: "exile",
            leftover: "stay",
          },
          {
            kind: "conditional",
            condition: { kind: "this-way", what: "exiled" },
            then: {
              kind: "reflexive-trigger",
              targets: [],
              value: { thisWay: "exiled" },
              effect: {
                kind: "modify-pt-all",
                filter: { type: "creature" },
                exceptSource: true,
                power: { product: [{ triggerValue: true }, -1] },
                toughness: { product: [{ triggerValue: true }, -1] },
                duration: "end-of-turn",
              },
              text: "When you do, each other creature gets -X/-X until end of turn, where X is the number of cards exiled this way.",
            },
          },
        ],
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
