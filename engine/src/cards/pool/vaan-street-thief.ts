import { defineCard } from "../define.js";

// EDHREC rank 7152.
// Makes Treasure → "Treasure Token".
//
// The exiled card is cast as the first ability resolves, timing ignored and
// its costs paid (the rulings — Chandra, Torch of Defiance's shape, from the
// damaged player's library); a card not cast, a land or one declined, stays
// exiled and makes the Treasure. "A spell you don't own" is one whose owner
// isn't its caster (Don Andrés, the Renegade's `ownedBy: "opponent"`).

const RAID_TEXT =
  "Whenever one or more Scouts, Pirates, and/or Rogues you control deal combat damage to a player, exile the top card of that player's library. You may cast it. If you don't, create a Treasure token.";
const GROW_TEXT =
  "Whenever you cast a spell you don't own, put a +1/+1 counter on each Scout, Pirate, and Rogue you control.";
const CREW = ["Scout", "Pirate", "Rogue"] as const;

export default defineCard({
  name: "Vaan, Street Thief",
  manaCost: "{2}{R}",
  colors: ["R"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Scout"],
  power: 2,
  toughness: 2,
  text: `${RAID_TEXT}\n${GROW_TEXT}`,
  triggered: [
    {
      trigger: { on: "deals-damage-batch", who: "you-control", filter: { subtypes: CREW }, combat: true },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "exile-from-library", whose: "trigger-player", amount: 1 },
          {
            kind: "cast-now",
            from: "exiled-this-way",
            else: { kind: "create-token", token: "Treasure Token", count: 1 },
          },
        ],
      },
      resolve: null,
      text: RAID_TEXT,
    },
    {
      trigger: { on: "cast-spell", who: "you", filter: { ownedBy: "opponent" } },
      targets: [],
      effect: {
        kind: "add-counter-all",
        filter: { controlledBy: "you", subtypes: CREW },
        counter: "+1/+1",
        amount: 1,
      },
      resolve: null,
      text: GROW_TEXT,
    },
  ],
});
