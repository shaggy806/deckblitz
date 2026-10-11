import { defineCard } from "../define.js";

// EDHREC rank 19280.
//
// Rulings:
//   [2026-08-21] To determine the total cost of a spell, start with the mana cost or alternative
//     cost (such as a flashback cost) you're paying, add any cost increases, then apply any cost
//     reductions. The mana value of the spell is determined only by its mana cost, no matter what
//     the total cost to cast the spell was.
//   [2026-08-21] If a card with flashback is put into your graveyard during your turn, you can
//     cast it if it's legal to do so before any other player can take any actions.
//   [2026-08-21] You must still follow any timing restrictions and permissions, including those
//     based on the card's type. For instance, you can cast a sorcery using flashback only when you
//     could normally cast a sorcery.
//   [2026-08-21] A spell cast using flashback will always be exiled afterward, whether it
//     resolves, is countered, or leaves the stack in some other way.
//   [2026-08-21] You can cast a spell using flashback even if it was somehow put into your
//     graveyard without having been cast.
//
// Snapcaster Mage's trigger, with haste in place of flash.

const ETB_TEXT =
  "When this creature enters, target instant or sorcery card in your graveyard gains flashback until end of turn. The flashback cost is equal to its mana cost.";

export default defineCard({
  name: "Stingcaster Mage",
  manaCost: "{1}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Human", "Wizard"],
  power: 2,
  toughness: 1,
  keywords: ["haste"],
  text: `Haste\n${ETB_TEXT} (You may cast that card from your graveyard for its flashback cost. Then exile it.)`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: ["instant-or-sorcery-in-your-graveyard"],
      effect: { kind: "grant-flashback", target: 0 },
      resolve: null,
      text: ETB_TEXT,
    },
  ],
});
