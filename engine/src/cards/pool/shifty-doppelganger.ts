import { defineCard } from "../define.js";

// EDHREC rank 28596.
//
// The exile is the cost, so "this card" is the card in exile the cost made
// (rule 400.7j), `{ paid: "exiled" }`, which the delayed ability remembers.
// It's about the creature this resolution put onto the battlefield; it
// sacrifices it, and only if that happened ("if you do" — a `this-way`
// "sacrificed") returns the remembered card, while it's still that card in
// exile (rule 603.7c).
//
// Rulings:
//   If the creature is not still on the battlefield at beginning of the End
//   step, then you do not return this card to the battlefield.
//   Putting the card onto the battlefield is optional. When the ability
//   resolves, you can choose not to.

const TEXT =
  "{3}{U}, Exile this creature: You may put a creature card from your hand onto the battlefield. If you do, that creature gains haste until end of turn. At the beginning of the next end step, sacrifice that creature. If you do, return this card to the battlefield.";

export default defineCard({
  name: "Shifty Doppelganger",
  manaCost: "{2}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Shapeshifter"],
  power: 1,
  toughness: 1,
  text: TEXT,
  activated: [
    {
      cost: { mana: "{3}{U}", tap: false, do: { kind: "exile", target: "source" } },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          {
            kind: "look-and-choose",
            zone: "hand",
            min: 0,
            max: 1,
            destination: "battlefield",
            leftover: "stay",
            filter: { type: "creature" },
            then: { kind: "grant-keyword", target: 0, keyword: "haste", duration: "end-of-turn" },
          },
          {
            kind: "delayed-trigger",
            at: { step: "end" },
            about: "put-onto-battlefield",
            remember: { doppelganger: { set: { paid: "exiled" } } },
            effect: {
              kind: "sequence",
              effects: [
                { kind: "sacrifice-target", target: 0 },
                {
                  kind: "conditional",
                  condition: { kind: "this-way", what: "sacrificed" },
                  then: { kind: "put-onto-battlefield", target: { remembered: "doppelganger" } },
                },
              ],
            },
            text: "Sacrifice that creature. If you do, return Shifty Doppelganger to the battlefield.",
          },
        ],
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
