import { defineCard } from "../define.js";

// The cards are exiled with it (linked, rule 607.2a). The discount counts
// the cards exiled with it that are still there (its ruling: one that leaves
// exile no longer counts) — the `"exiled-with-source"` set, read live.
export default defineCard({
  name: "The Kenriths' Royal Funeral",
  manaCost: "{2}{W}{B}",
  colors: ["W", "B"],
  supertypes: ["legendary"],
  types: ["enchantment"],
  text:
    "When The Kenriths' Royal Funeral enters, exile up to two target legendary creature cards from your graveyard. You draw X cards and you lose X life, where X is the greatest mana value among cards exiled this way.\n" +
    "Legendary spells you cast cost {1} less to cast for each card exiled with The Kenriths' Royal Funeral.",
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [
        {
          kind: "any-number",
          of: { kind: "card-in-graveyard", whose: "you", filter: { type: "creature", supertype: "legendary" } },
          max: 2,
        },
      ],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "for-each-target", from: 0, effect: { kind: "exile", target: 0, linked: true } },
          { kind: "draw", amount: { aggregate: "max", of: "mana-value", filter: {}, in: { thisWay: "exiled" } } },
          {
            kind: "lose-life",
            who: "you",
            amount: { aggregate: "max", of: "mana-value", filter: {}, in: { thisWay: "exiled" } },
          },
        ],
      },
      resolve: null,
      text: "When The Kenriths' Royal Funeral enters, exile up to two target legendary creature cards from your graveyard. You draw X cards and you lose X life, where X is the greatest mana value among cards exiled this way.",
    },
  ],
  static: [
    {
      affects: { scope: "self" },
      costModification: {
        applies: { supertype: "legendary" },
        reduceGeneric: { aggregate: "count", filter: {}, in: "exiled-with-source" },
        when: { caster: "you" },
      },
      text: "Legendary spells you cast cost {1} less to cast for each card exiled with The Kenriths' Royal Funeral.",
    },
  ],
});
