import { defineCard } from "../define.js";

const TEXT =
  "When Commander Musiker enters, choose one —\n• Exile up to one target card from a graveyard. You gain 2 life.\n• Investigate. You lose 2 life. (Create a Clue token. It's an artifact with \"{2}, Sacrifice this token: Draw a card.\")";

export default defineCard({
  name: "Commander Raffi Musiker",
  manaCost: "{2}{B}",
  colors: ["B"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Officer"],
  power: 3,
  toughness: 2,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: {
        kind: "modal",
        announced: true,
        minModes: 1,
        maxModes: 1,
        modes: [
          {
            targets: [{ kind: "optional", of: { kind: "card-in-graveyard", whose: "any" } }],
            effect: {
              kind: "sequence",
              effects: [
                { kind: "exile", target: 0 },
                { kind: "gain-life", amount: 2 },
              ],
            },
            text: "Exile up to one target card from a graveyard. You gain 2 life.",
          },
          {
            text: "Investigate. You lose 2 life.",
            effect: {
              kind: "sequence",
              effects: [
                { kind: "create-token", token: "Clue Token", investigate: true, count: 1 },
                { kind: "lose-life", amount: 2 },
              ],
            },
          },
        ],
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
