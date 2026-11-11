import { defineCard } from "../define.js";

// Rulings:
//   You cast the copy while the ability is resolving and still on the stack.
//   Because you're paying the spell's costs, if the spell has {X} in its mana cost, you may choose
//     its value as normal.
//   If you don't want to cast the copy, you can choose not to; the copy ceases to exist.

const COPY_TEXT =
  "Whenever one or more Assassins you control deal combat damage to a player, exile up to one target Assassin card or card with freerunning from your graveyard. If you do, copy it. You may cast the copy.";

export default defineCard({
  name: "Jacob Frye",
  manaCost: "{2}{B}",
  colors: ["B"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Assassin"],
  power: 3,
  toughness: 2,
  pairing: { kind: "partner-with", name: "Evie Frye" },
  text: `Partner with Evie Frye (When this creature enters, target player may put Evie into their hand from their library, then shuffle.)\n${COPY_TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: ["player"],
      effect: {
        kind: "each-player-may",
        who: { controllerOf: 0 },
        prompt: "Search your library for a card named Evie Frye?",
        effect: {
          kind: "search-library",
          filter: { name: "Evie Frye" },
          destination: "hand",
          min: 0,
          max: 1,
          reveal: true,
        },
      },
      resolve: null,
      text: "When this creature enters, target player may search their library for a card named Evie Frye, reveal it, put it into their hand, then shuffle.",
    },
    {
      trigger: { on: "deals-damage-batch", who: "you-control", filter: { subtype: "Assassin" }, combat: true },
      targets: [
        {
          kind: "optional",
          of: {
            kind: "card-in-graveyard",
            whose: "you",
            filter: { anyOf: [{ subtype: "Assassin" }, { hasKeyword: "freerunning" }] },
          },
        },
      ],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "exile", target: 0 },
          { kind: "cast-now", from: "exiled-this-way", copies: 1 },
        ],
      },
      resolve: null,
      text: COPY_TEXT,
    },
  ],
});
