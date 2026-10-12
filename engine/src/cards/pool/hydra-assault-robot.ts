import { defineCard } from "../define.js";

// EDHREC rank 14238. Marvel Super Heroes.
//
// "A Villain and/or artifact" is one permanent that is either or both, so
// one trigger per permanent entering — a Villain artifact fires it once.
// Not itself ("another").
const TEXT =
  "Whenever another Villain and/or artifact you control enters, this creature deals 1 damage to target opponent.";

export default defineCard({
  name: "HYDRA Assault Robot",
  manaCost: "{1}{R}",
  colors: ["R"],
  types: ["artifact", "creature"],
  subtypes: ["Robot", "Villain"],
  power: 1,
  toughness: 3,
  text: TEXT,
  triggered: [
    {
      trigger: {
        on: "enters-battlefield",
        who: "you-control",
        filter: { anyOf: [{ subtype: "Villain" }, { type: "artifact" }] },
        otherOnly: true,
      },
      targets: ["opponent"],
      effect: { kind: "damage", amount: 1, target: 0 },
      resolve: null,
      text: TEXT,
    },
  ],
});
