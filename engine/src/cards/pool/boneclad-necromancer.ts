import { defineCard } from "../define.js";

// EDHREC rank 24838.
//
// Vile Rebirth's exile-and-Zombie, optional: the target is chosen as the
// trigger goes on the stack, the "may" answered as it resolves, and the
// Zombie comes only if the card was exiled.

const TEXT =
  "When this creature enters, you may exile target creature card from a graveyard. If you do, create a 2/2 black Zombie creature token.";

export default defineCard({
  name: "Boneclad Necromancer",
  manaCost: "{3}{B}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Human", "Wizard"],
  power: 3,
  toughness: 3,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [{ kind: "card-in-graveyard", whose: "any", filter: { type: "creature" } }],
      effect: {
        kind: "may",
        prompt: "Exile target creature card from a graveyard?",
        effect: {
          kind: "sequence",
          effects: [
            { kind: "exile", target: 0 },
            {
              kind: "conditional",
              condition: { kind: "this-way", what: "exiled", atLeast: 1 },
              then: { kind: "create-token", token: "Zombie Token", count: 1 },
            },
          ],
        },
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
