import { defineCard } from "../define.js";

// EDHREC rank 9149.
//
// Rulings:
//   [2024-11-08] You don't choose a target for Sutina's last ability at the time it triggers.
//     Rather, a second "reflexive" ability triggers when you return a land you control to its
//     owner's hand this way. You choose a target for that ability as it goes on the stack. Each
//     player may respond to this triggered ability as normal.

// The land is chosen, not targeted (choosing none is declining); only a
// land actually returned sets off the reflexive trigger, whose target is
// chosen as it goes on the stack (the ruling) — Doombot Harbinger's shape.
export default defineCard({
  name: "Sutina, Speaker of the Tajuru",
  manaCost: "{2}{G}",
  colors: ["G"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Elf", "Scout"],
  power: 2,
  toughness: 2,
  text: "When Sutina enters, search your library for a basic land card, put it onto the battlefield tapped, then shuffle.\nWhenever Sutina attacks, you may return a land you control to its owner's hand. When you do, put a +1/+1 counter on target creature.",
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: {
        kind: "search-library",
        filter: { supertype: "basic", type: "land" },
        destination: "battlefield",
        min: 0,
        max: 1,
        enterTapped: true,
      },
      resolve: null,
      text: "When Sutina enters, search your library for a basic land card, put it onto the battlefield tapped, then shuffle.",
    },
    {
      trigger: { on: "attacks", who: "self" },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          {
            kind: "choose-permanents",
            filter: { type: "land", controlledBy: "you" },
            min: 0,
            upTo: 1,
            then: { kind: "return-to-hand", target: 0 },
            prompt: "You may return a land you control to its owner's hand",
          },
          {
            kind: "conditional",
            condition: { kind: "this-way", what: "returned-to-hand" },
            then: {
              kind: "reflexive-trigger",
              targets: ["creature"],
              effect: { kind: "add-counter", target: 0, counter: "+1/+1", amount: 1 },
              text: "When you do, put a +1/+1 counter on target creature.",
            },
          },
        ],
      },
      resolve: null,
      text: "Whenever Sutina attacks, you may return a land you control to its owner's hand. When you do, put a +1/+1 counter on target creature.",
    },
  ],
});
