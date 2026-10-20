import { defineCard } from "../define.js";

// EDHREC rank 16820.
//
// Rulings:
//   [2021-09-24] Voldaren Ambusher's ability counts the number of Vampires you control as it
//     resolves. If something happens in response such that you don't control any Vampires when it
//     resolves, Voldaren Ambusher won't deal damage to the target creature or planeswalker.
//   [2021-09-24] Voldaren Ambusher's ability cares whether an opponent lost life this turn, not
//     how their life total changed. For example, an opponent who gained 2 life and lost 1 life in
//     the same turn still lost life.
const TEXT =
  "When this creature enters, if an opponent lost life this turn, it deals X damage to up to one target creature or planeswalker, where X is the number of Vampires you control.";

export default defineCard({
  name: "Voldaren Ambusher",
  manaCost: "{2}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Vampire", "Archer"],
  power: 2,
  toughness: 2,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      condition: { kind: "turn-stat", stat: "life-lost", who: "opponent", atLeast: 1 },
      targets: [{ kind: "optional", of: { kind: "permanent", filter: { typesAnyOf: ["creature", "planeswalker"] } } }],
      effect: { kind: "damage", target: 0, amount: { countOf: { subtype: "Vampire", controlledBy: "you" } } },
      resolve: null,
      text: TEXT,
    },
  ],
});
