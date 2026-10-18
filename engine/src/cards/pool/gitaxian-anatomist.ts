import { defineCard } from "../define.js";

// EDHREC rank 15614.
//
// "You may tap it. If you do, proliferate": only a tap that happens counts (`this-way:
// tapped`), so an Anatomist already tapped, or gone from the battlefield, proliferates
// nothing.

const TEXT = "When this creature enters, you may tap it. If you do, proliferate.";

export default defineCard({
  name: "Gitaxian Anatomist",
  manaCost: "{3}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Phyrexian", "Wizard"],
  power: 2,
  toughness: 5,
  text: `${TEXT} (Choose any number of permanents and/or players, then give each another counter of each kind already there.)`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: {
        kind: "may",
        prompt: "Tap this creature to proliferate?",
        effect: {
          kind: "sequence",
          effects: [
            { kind: "tap", target: "source" },
            {
              kind: "conditional",
              condition: { kind: "this-way", what: "tapped" },
              then: { kind: "proliferate" },
            },
          ],
        },
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
