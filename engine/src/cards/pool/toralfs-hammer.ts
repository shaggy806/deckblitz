import { defineCard } from "../define.js";

// The equipped creature is the ability's source and the Hammer the damage's
// (its rulings), so `from: "granter"`; with the target illegal nothing happens,
// the return included.
const GRANT_TEXT =
  "{1}{R}, {T}, Unattach Toralf's Hammer: It deals 3 damage to any target. Return Toralf's Hammer to its owner's hand.";
const PT_TEXT = "Equipped creature gets +3/+0 as long as it's legendary.";

export default defineCard({
  name: "Toralf's Hammer",
  art: "https://cards.scryfall.io/art_crop/back/2/2/22a6a5f1-1405-4efb-af3e-e1f58d664e99.jpg",
  manaCost: "{1}{R}",
  colors: ["R"],
  supertypes: ["legendary"],
  types: ["artifact"],
  subtypes: ["Equipment"],
  text: `Equipped creature has "${GRANT_TEXT}"\n${PT_TEXT}\nEquip {1}{R}`,
  faces: ["Toralf, God of Fury", "Toralf's Hammer"],
  activated: [
    {
      cost: { mana: "{1}{R}", tap: false },
      targets: ["creature-you-control"],
      effect: { kind: "attach", target: 0 },
      resolve: null,
      text: "Equip {1}{R}",
      sorcerySpeed: true,
    },
  ],
  static: [
    {
      affects: { scope: "attached" },
      grantsActivated: [
        {
          cost: { mana: "{1}{R}", tap: true, unattach: "granter" },
          targets: ["any-target"],
          effect: {
            kind: "sequence",
            effects: [
              { kind: "damage", amount: 3, target: 0, from: "granter" },
              { kind: "return-to-hand", target: "granter" },
            ],
          },
          resolve: null,
          text: GRANT_TEXT,
        },
      ],
      text: `Equipped creature has "${GRANT_TEXT}"`,
    },
    {
      affects: { scope: "attached" },
      condition: { kind: "source", filter: { attachedTo: { supertype: "legendary" } } },
      grantPt: [3, 0],
      text: PT_TEXT,
    },
  ],
});
