import { defineCard } from "../define.js";

// EDHREC rank 7708.
//
// Rulings:
//   [2023-06-16] Once the exiled permanent returns, it's considered a new object with no relation
//     to the object that it was. Auras attached to the exiled permanent will be put into their
//     owners' graveyards. Equipment attached to the exiled permanent will become unattached and
//     remain on the battlefield. Any counters on the exiled permanent will cease to exist.
//   [2023-06-16] Meneldor's second ability can target any permanent you own, including those
//     another player controls.
//   [2023-06-16] If a token is exiled this way, it will cease to exist and won't return to the
//     battlefield.

export default defineCard({
  name: "Meneldor, Swift Savior",
  manaCost: "{3}{U}",
  colors: ["U"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Bird", "Soldier"],
  power: 3,
  toughness: 3,
  keywords: ["flying"],
  text: "Flying\nWhenever Meneldor deals combat damage to a player, exile up to one target creature you own, then return it to the battlefield under your control.",
  triggered: [
    {
      trigger: { on: "deals-combat-damage-to-player", who: "self" },
      // Any creature you own, whoever controls it (the ruling); a token
      // exiled this way ceases to exist (`flicker`).
      targets: [{ kind: "optional", of: { kind: "permanent", filter: { type: "creature", ownedBy: "you" } } }],
      effect: { kind: "flicker", target: 0, underYourControl: true },
      resolve: null,
      text: "Whenever Meneldor deals combat damage to a player, exile up to one target creature you own, then return it to the battlefield under your control.",
    },
  ],
});
