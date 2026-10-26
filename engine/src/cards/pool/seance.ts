import { defineCard } from "../define.js";

// EDHREC rank 20062.
//
// Rulings:
//   [2017-03-14] The token doesn't have haste (unless the card it's copying has haste) and usually
//     won't be able to attack.
//   [2017-03-14] If the copied card has {X} in its mana cost, X is considered to be 0.
//   [2017-03-14] The token copies exactly what was printed on the original card and nothing else.
//   [2017-03-14] The token is a Spirit in addition to its other types. This is a copiable value of
//     the token that other effects may copy.
//   [2017-03-14] The delayed triggered ability that exiles the token isn't a characteristic of the
//     token. If an effect such as populate copies the token, the new copy won't be exiled.
//
// The Scarab God's shape (exile the targeted card, then copy it), inside the
// trigger's "you may", with the Spirit a copy exception and the end-step exile
// a delayed trigger over the token made (`exileAtEndStep`), not a copiable value.

const TEXT =
  "At the beginning of each upkeep, you may exile target creature card from your graveyard. If you do, create a token that's a copy of that card, except it's a Spirit in addition to its other types. Exile it at the beginning of the next end step.";

export default defineCard({
  name: "Séance",
  manaCost: "{2}{W}{W}",
  colors: ["W"],
  types: ["enchantment"],
  text: TEXT,
  triggered: [
    {
      trigger: { on: "step-begins", step: "upkeep", who: "any" },
      targets: [{ kind: "card-in-graveyard", whose: "you", filter: { type: "creature" } }],
      effect: {
        kind: "may",
        prompt: "Exile the target creature card to create a Spirit token copy of it?",
        effect: {
          kind: "sequence",
          effects: [
            { kind: "exile", target: 0 },
            {
              kind: "conditional",
              condition: { kind: "this-way", what: "exiled" },
              then: {
                kind: "create-token-copy",
                of: 0,
                count: 1,
                who: "you",
                exileAtEndStep: true,
                exceptions: { addSubtypes: ["Spirit"] },
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
