import { defineCard } from "../define.js";

// EDHREC rank 7855.
// Makes Treasure → use "Treasure Token".
//
// Rulings:
//   [2023-06-16] The Ring can tempt you even if you don't control a creature. In this case,
//     abilities that trigger "whenever the Ring tempts you" will still trigger.
//   [2023-06-16] The Ring gains its abilities in order from top to bottom. Once it gains an
//     ability, it has that ability for the rest of the game.
//   [2023-06-16] Each player can have only one emblem named The Ring and only one Ring-bearer at a
//     time.
//   [2023-06-16] Some spells and abilities that cause the Ring to tempt you may require targets.
//     If each target chosen is an illegal target as that spell or ability tries to resolve, it
//     won't resolve. The Ring won't tempt you.
//   [2023-06-16] Each time the Ring tempts you, you must choose a creature if you control one.
//   [2023-06-16] If the creature you choose as your Ring-bearer was already your Ring-bearer, that
//     still counts as choosing that creature as your Ring-bearer for the purpose of abilities that
//     trigger "whenever you choose a creature as your Ring-bearer" or abilities that care about
//     which creature was chosen as your Ring-bearer.
//   [2023-06-16] As the Ring tempts you, you get an emblem named The Ring if you don't have one.
//     Then your emblem gains its next ability and you choose a creature you control to become (or
//     remain) your Ring-bearer.

export default defineCard({
  name: "Bilbo, Retired Burglar",
  manaCost: "{1}{U}{R}",
  colors: ["U", "R"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Halfling", "Rogue"],
  power: 1,
  toughness: 3,
  text: "When Bilbo enters or leaves the battlefield, the Ring tempts you.\nWhenever Bilbo deals combat damage to a player, create a Treasure token.",
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: { kind: "the-ring-tempts-you" },
      resolve: null,
      text: "When Bilbo enters or leaves the battlefield, the Ring tempts you.",
    },
    {
      trigger: { on: "leaves-battlefield", who: "self" },
      targets: [],
      effect: { kind: "the-ring-tempts-you" },
      resolve: null,
      text: "When Bilbo enters or leaves the battlefield, the Ring tempts you.",
    },
    {
      trigger: { on: "deals-combat-damage-to-player", who: "self" },
      targets: [],
      effect: { kind: "create-token", token: "Treasure Token", count: 1 },
      resolve: null,
      text: "Whenever Bilbo deals combat damage to a player, create a Treasure token.",
    },
  ],
});
