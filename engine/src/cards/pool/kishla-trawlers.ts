import { defineCard } from "../define.js";

// EDHREC rank 20681.
//
// Rulings:
//   [2025-04-04] You don't choose a target for Kishla Trawlers's ability at the time it triggers.
//     Rather, a second "reflexive" ability triggers when you exile a creature card from your
//     graveyard this way. You choose a target for that ability as it goes on the stack. Each
//     player may respond to this triggered ability as normal.
//
// "You may exile a creature card from your graveyard" is Heated Argument's
// choice of none or one; "when you do" a reflexive trigger (rule 603.12) only
// once a card was exiled, its target chosen as it goes on the stack.

const TEXT =
  "When this creature enters, you may exile a creature card from your graveyard. When you do, return target instant or sorcery card from your graveyard to your hand.";

export default defineCard({
  name: "Kishla Trawlers",
  manaCost: "{2}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Human", "Citizen"],
  power: 3,
  toughness: 2,
  text: TEXT,
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
            max: 1,
            destination: "exile",
            leftover: "stay",
          },
          {
            kind: "conditional",
            condition: { kind: "this-way", what: "exiled" },
            then: {
              kind: "reflexive-trigger",
              targets: [{ kind: "card-in-graveyard", whose: "you", filter: { typesAnyOf: ["instant", "sorcery"] } }],
              effect: { kind: "return-to-hand", target: 0, from: "graveyard" },
              text: "When you do, return target instant or sorcery card from your graveyard to your hand.",
            },
          },
        ],
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
