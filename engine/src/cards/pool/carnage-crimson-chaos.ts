import { defineCard } from "../define.js";

// The returned creature gains both abilities indefinitely, as granted
// abilities (a later loss of all abilities takes them — rule 613.7).
export default defineCard({
  name: "Carnage, Crimson Chaos",
  manaCost: "{2}{B}{R}",
  colors: ["B", "R"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Symbiote", "Villain"],
  power: 4,
  toughness: 3,
  keywords: ["trample"],
  mayhem: { cost: "{B}{R}" },
  text: "Trample\nWhen Carnage enters, return target creature card with mana value 3 or less from your graveyard to the battlefield. It gains \"This creature attacks each combat if able\" and \"When this creature deals combat damage to a player, sacrifice it.\"\nMayhem {B}{R}",
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [{ kind: "card-in-graveyard", whose: "you", filter: { type: "creature", manaValue: { op: "lte", n: 3 } } }],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "put-onto-battlefield", target: 0 },
          {
            kind: "grant-static",
            target: 0,
            ability: {
              affects: { scope: "self" },
              restrictions: ["must-attack"],
              text: "This creature attacks each combat if able.",
            },
            duration: "permanent",
          },
          {
            kind: "grant-triggered",
            target: 0,
            duration: "permanent",
            ability: {
              trigger: { on: "deals-combat-damage-to-player", who: "self" },
              targets: [],
              effect: { kind: "sacrifice-source" },
              resolve: null,
              text: "When this creature deals combat damage to a player, sacrifice it.",
            },
          },
        ],
      },
      resolve: null,
      text: "When Carnage enters, return target creature card with mana value 3 or less from your graveyard to the battlefield. It gains \"This creature attacks each combat if able\" and \"When this creature deals combat damage to a player, sacrifice it.\"",
    },
  ],
});
