import { defineCard } from "../define.js";

// Kroxa and Kunoros's shape with two: "you may exile two cards from your
// graveyard" is offered only with two there to exile, chosen as it resolves.
// "When you do" is a reflexive trigger (rule 603.12, the ruling) whose target
// is chosen only then, so it can't be one of the two just exiled.
const TEXT =
  "When this creature enters, you may exile two cards from your graveyard. When you do, return target creature card from your graveyard to the battlefield.";

export default defineCard({
  name: "Young Necromancer",
  manaCost: "{4}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Human", "Warlock"],
  power: 2,
  toughness: 3,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: {
        kind: "conditional",
        condition: { kind: "cards-in-graveyard", atLeast: 2 },
        then: {
          kind: "may",
          prompt: "Exile two cards from your graveyard?",
          effect: {
            kind: "sequence",
            effects: [
              {
                kind: "look-and-choose",
                zone: "graveyard",
                min: 2,
                max: 2,
                destination: "exile",
                leftover: "stay",
              },
              {
                kind: "conditional",
                condition: { kind: "this-way", what: "exiled", atLeast: 2 },
                then: {
                  kind: "reflexive-trigger",
                  targets: [{ kind: "card-in-graveyard", whose: "you", filter: { type: "creature" } }],
                  effect: { kind: "put-onto-battlefield", target: 0, underYourControl: true },
                  text: "When you do, return target creature card from your graveyard to the battlefield.",
                },
              },
            ],
          },
        },
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
