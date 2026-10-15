import { defineCard } from "../define.js";

// Rulings:
//   You don't choose a target as the ability triggers: a reflexive ability
//   triggers when you sacrifice an artifact this way, and its target is chosen
//   as it goes on the stack. If that target is illegal as it tries to
//   resolve, it doesn't resolve and you don't draw.
//
// Cavalier of Night's shape (rule 603.12): the sacrifice is asked as the
// enters trigger resolves. This creature is an artifact itself, so it may be
// the one sacrificed.

const TEXT =
  "When this creature enters, you may sacrifice an artifact. When you do, put a +1/+1 counter on target creature and draw a card.";

export default defineCard({
  name: "Selfcraft Mechan",
  manaCost: "{3}{U}",
  colors: ["U"],
  types: ["artifact", "creature"],
  subtypes: ["Robot", "Artificer"],
  power: 3,
  toughness: 4,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: {
        kind: "each-player-may",
        who: "you",
        options: [{ sacrifice: { type: "artifact" }, text: "Sacrifice an artifact" }],
        ifDid: {
          kind: "reflexive-trigger",
          targets: ["creature"],
          effect: {
            kind: "sequence",
            effects: [
              { kind: "add-counter", target: 0, counter: "+1/+1", amount: 1 },
              { kind: "draw", amount: 1 },
            ],
          },
          text: "When you do, put a +1/+1 counter on target creature and draw a card.",
        },
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
