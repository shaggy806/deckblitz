import { defineCard } from "../define.js";

// Commander 2020.

const SAC = "Sacrifice a Human: Put a +1/+1 counter on Silvar. It gains indestructible until end of turn.";

export default defineCard({
  name: "Silvar, Devourer of the Free",
  manaCost: "{3}{B}{R}",
  colors: ["B", "R"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Cat", "Nightmare"],
  power: 4,
  toughness: 2,
  keywords: ["menace"],
  pairing: { kind: "partner-with", name: "Trynn, Champion of Freedom" },
  text: `Partner with Trynn, Champion of Freedom (When this creature enters, target player may put Trynn into their hand from their library, then shuffle.)\nMenace\n${SAC}`,
  activated: [
    {
      cost: { mana: null, tap: false, sacrifice: { filter: { subtype: "Human" } } },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "add-counter", target: "source", counter: "+1/+1", amount: 1 },
          { kind: "grant-keyword", target: "source", keyword: "indestructible", duration: "end-of-turn" },
        ],
      },
      resolve: null,
      text: SAC,
    },
  ],
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: ["player"],
      effect: {
        kind: "each-player-may",
        who: { controllerOfTarget: 0 },
        prompt: "Search your library for a card named Trynn, Champion of Freedom?",
        effect: {
          kind: "search-library",
          filter: { name: "Trynn, Champion of Freedom" },
          destination: "hand",
          min: 0,
          max: 1,
          reveal: true,
        },
      },
      resolve: null,
      text: "When this creature enters, target player may search their library for a card named Trynn, Champion of Freedom, reveal it, put it into their hand, then shuffle.",
    },
  ],
});
