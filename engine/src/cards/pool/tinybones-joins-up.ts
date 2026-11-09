import { defineCard } from "../define.js";

export default defineCard({
  name: "Tinybones Joins Up",
  manaCost: "{B}",
  colors: ["B"],
  supertypes: ["legendary"],
  types: ["enchantment"],
  text: "When Tinybones Joins Up enters, any number of target players each discard a card.\nWhenever a legendary creature you control enters, any number of target players each mill a card and lose 1 life.",
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [{ kind: "any-number", of: "player" }],
      effect: { kind: "for-each-target", from: 0, effect: { kind: "discard", target: 0, amount: 1 }, simultaneous: true },
      resolve: null,
      text: "When Tinybones Joins Up enters, any number of target players each discard a card.",
    },
    {
      trigger: { on: "enters-battlefield", who: "you-control", filter: { supertype: "legendary", type: "creature" } },
      targets: [{ kind: "any-number", of: "player" }],
      effect: {
        kind: "for-each-target",
        from: 0,
        effect: {
          kind: "sequence",
          effects: [
            { kind: "mill", target: 0, amount: 1 },
            { kind: "lose-life", amount: 1, target: 0 },
          ],
        },
        simultaneous: true,
      },
      resolve: null,
      text: "Whenever a legendary creature you control enters, any number of target players each mill a card and lose 1 life.",
    },
  ],
});
