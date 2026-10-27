import { defineCard } from "../define.js";

// EDHREC rank 20706.
//
// Rulings:
//   [2004-12-01] You can exile the card even if you choose no targets.
//   [2004-12-01] You may target Iname, Life Aspect. However, this doesn't do anything since the
//     card will no longer be in your graveyard when the creature cards are returned to your hand.
//   [2004-12-01] The targets of Iname, Life Aspect's ability are chosen when the ability is put
//     onto the stack, but you don't choose whether to exile Iname, Life Aspect until the ability
//     resolves.
//   [2021-06-18] If Iname is your commander in a game of Commander, you may choose to put it in
//     the command zone after it dies, but if you do, you won't be able to exile it. If you do
//     exile it, you may put it into the command zone from exile after resolving its ability.
//
// Greenwarden of Murasa's shape over an "any number of" group (Death Denied):
// the targets are chosen as it triggers (none is fine), the exile is a "may"
// as it resolves, and the return happens only if the exile did ("if you do").

const TEXT =
  "When Iname dies, you may exile it. If you do, return any number of target Spirit cards from your graveyard to your hand.";

export default defineCard({
  name: "Iname, Life Aspect",
  manaCost: "{4}{G}{G}",
  colors: ["G"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Spirit"],
  power: 4,
  toughness: 4,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "dies", who: "self" },
      targets: [{ kind: "any-number", of: { kind: "card-in-graveyard", whose: "you", filter: { subtype: "Spirit" } } }],
      effect: {
        kind: "may",
        prompt: "Exile Iname, Life Aspect to return the target Spirit cards from your graveyard to your hand?",
        effect: {
          kind: "sequence",
          effects: [
            { kind: "exile", target: "trigger-object" },
            {
              kind: "conditional",
              condition: { kind: "this-way", what: "exiled" },
              then: {
                kind: "for-each-target",
                from: 0,
                simultaneous: true,
                effect: { kind: "return-to-hand", target: 0, from: "graveyard" },
              },
            },
          ],
        },
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
