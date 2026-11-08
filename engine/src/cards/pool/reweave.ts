import { defineCard } from "../define.js";

// Wild Magic Surge's reveal behind a sacrifice: the sacrificed permanent is
// the target, so "shares a card type with the sacrificed permanent" is
// `sharesCardTypeWith` of that slot, read as it last existed (rule 608.2h).
// "If the player does": one that couldn't be sacrificed reveals nothing.
export default defineCard({
  name: "Reweave",
  manaCost: "{5}{U}",
  colors: ["U"],
  types: ["instant"],
  subtypes: ["Arcane"],
  text:
    "Target permanent's controller sacrifices it. If the player does, they reveal cards from the top of their library until they reveal a permanent card that shares a card type with the sacrificed permanent, put that card onto the battlefield, then shuffle.\nSplice onto Arcane {2}{U}{U} (As you cast an Arcane spell, you may reveal this card from your hand and pay its splice cost. If you do, add this card's effects to that spell.)",
  splice: { onto: "arcane", cost: "{2}{U}{U}" },
  targets: ["permanent"],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "sacrifice-target", target: 0, byItsController: true },
      {
        kind: "conditional",
        condition: { kind: "this-way", what: "sacrificed", atLeast: 1 },
        then: {
          kind: "reveal-until",
          whose: { controllerOf: 0 },
          filter: {
            typesAnyOf: ["artifact", "creature", "enchantment", "land", "planeswalker", "battle"],
            sharesCardTypeWith: 0,
          },
          put: "battlefield",
          rest: "shuffle",
        },
      },
    ],
  },
});
