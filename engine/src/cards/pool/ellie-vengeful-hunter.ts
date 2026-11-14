import { defineCard } from "../define.js";

// EDHREC rank 16025.
const ABILITY_TEXT =
  "Pay 2 life, Sacrifice another creature: Ellie deals 2 damage to target player and gains indestructible until end of turn.";

export default defineCard({
  name: "Ellie, Vengeful Hunter",
  manaCost: "{1}{B}{R}",
  colors: ["B", "R"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Survivor"],
  power: 3,
  toughness: 1,
  pairing: { kind: "partner-group", group: "Survivors" },
  text: `${ABILITY_TEXT}\nPartner—Survivors (You can have two commanders if both have this ability.)`,
  activated: [
    {
      cost: { mana: null, tap: false, payLife: 2, sacrifice: "creature-you-control" },
      otherOnly: true,
      targets: ["player"],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "damage", amount: 2, target: 0 },
          { kind: "grant-keyword", target: "source", keyword: "indestructible", duration: "end-of-turn" },
        ],
      },
      resolve: null,
      text: ABILITY_TEXT,
    },
  ],
});
