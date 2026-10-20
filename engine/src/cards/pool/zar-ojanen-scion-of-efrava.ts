import { defineCard } from "../define.js";

// The number of basic land types is read as the trigger resolves, and each
// creature's toughness against it then: the effect binds the filter's
// `{ amount }` as it applies (`bindDynamicCompares`).
const text =
  "Domain — Whenever Zar Ojanen becomes tapped, put a +1/+1 counter on each creature you control with toughness less than the number of basic land types among lands you control.";

export default defineCard({
  name: "Zar Ojanen, Scion of Efrava",
  manaCost: "{3}{G}{W}",
  colors: ["G", "W"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Cat", "Warrior"],
  power: 4,
  toughness: 4,
  text,
  triggered: [
    {
      trigger: { on: "becomes-tapped", who: "self" },
      targets: [],
      effect: {
        kind: "add-counter-all",
        filter: {
          type: "creature",
          controlledBy: "you",
          toughness: { op: "lt", n: { amount: { basicLandTypes: "you" } } },
        },
        counter: "+1/+1",
        amount: 1,
      },
      resolve: null,
      text,
    },
  ],
});
