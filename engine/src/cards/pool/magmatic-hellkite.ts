import { defineCard } from "../define.js";

// The land's controller must search (no "may"), as it last existed if the
// land has gone (rule 608.2h); the find enters tapped with a stun counter on
// it (rule 122.6 — `search-library`'s `withCounters`; stun, rule 122.1d).
export default defineCard({
  name: "Magmatic Hellkite",
  manaCost: "{2}{R}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Dragon"],
  power: 4,
  toughness: 5,
  keywords: ["flying"],
  text:
    "Flying\nWhen this creature enters, destroy target nonbasic land an opponent controls. Its controller searches their library for a basic land card, puts it onto the battlefield tapped with a stun counter on it, then shuffles. (If a permanent with a stun counter would become untapped, remove one from it instead.)",
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [{ kind: "permanent", whose: "opponent", filter: { type: "land", notSupertype: "basic" } }],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "destroy", target: 0 },
          {
            kind: "search-library",
            who: { controllerOf: 0 },
            filter: { supertype: "basic", type: "land" },
            destination: "battlefield",
            enterTapped: true,
            min: 0,
            max: 1,
            withCounters: { kind: "stun", amount: 1 },
          },
        ],
      },
      resolve: null,
      text: "When this creature enters, destroy target nonbasic land an opponent controls. Its controller searches their library for a basic land card, puts it onto the battlefield tapped with a stun counter on it, then shuffles.",
    },
  ],
});
