import { defineCard } from "../define.js";

// Rulings:
//   If a permanent has more than one Role attached to it controlled by the same player, each of
//     those Roles except the one with the most recent timestamp is put into its owner's graveyard.
//   Hexproof and shroud won't prevent a Role from becoming attached to a permanent if the ability
//     creating that Role attached to that permanent doesn't target it.

const TEXT =
  'When this creature enters, create a 1/1 black Rat creature token with "This creature can\'t block." Then for each Rat you control, create a Wicked Role token attached to that Rat. (If you control another Role on it, put that one into the graveyard. Enchanted creature gets +1/+1. When this token is put into a graveyard, each opponent loses 1 life.)';

export default defineCard({
  name: "Twisted Sewer-Witch",
  manaCost: "{3}{B}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Human", "Warlock"],
  power: 3,
  toughness: 4,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "create-token", token: "Rat Token (Can't Block)", count: 1 },
          {
            // Each Rat in turn bound to slot 0, a Role made attached to it.
            kind: "for-each-permanent",
            filter: { subtype: "Rat", controlledBy: "you" },
            effect: { kind: "create-token", token: "Wicked Role Token", count: 1, attachedTo: 0 },
          },
        ],
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
