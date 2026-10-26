import { defineCard } from "../define.js";

// Eventide (EVE). EDHREC rank 19444.
//
// Slogurk's "up to N target land cards" group, behind Cartographer's "you may".

export default defineCard({
  name: "Tilling Treefolk",
  manaCost: "{2}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Treefolk", "Druid"],
  power: 1,
  toughness: 3,
  text: "When this creature enters, you may return up to two target land cards from your graveyard to your hand.",
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [{ kind: "any-number", of: { kind: "card-in-graveyard", whose: "you", filter: { type: "land" } }, max: 2 }],
      effect: {
        kind: "may",
        prompt: "Return the target land cards from your graveyard to your hand?",
        effect: {
          kind: "for-each-target",
          from: 0,
          effect: { kind: "return-to-hand", target: 0, from: "graveyard" },
          simultaneous: true,
        },
      },
      resolve: null,
      text: "When this creature enters, you may return up to two target land cards from your graveyard to your hand.",
    },
  ],
});
