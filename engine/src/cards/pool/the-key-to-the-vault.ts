import { defineCard } from "../define.js";
import { equip } from "../helpers.js";

// Outlaws of Thunder Junction (OTJ). "That many" is the combat damage dealt
// (`triggerValue`); the nonland card exiled may be cast as the trigger
// resolves, free and timing ignored (`cast-now` of the pick) — not later.
//
// Rulings:
//   [2024-04-12] You choose whether to cast the exiled card as The Key to the Vault's triggered
//     ability resolves. If you do, you do so as part of the resolution of that ability. You can't
//     wait to cast it later in the turn. Timing restrictions based on the card's types are ignored.
//   [2024-04-12] If the spell you cast has {X} in its mana cost, you must choose 0 as the value of X
//     when casting it without paying its mana cost.

const TEXT =
  "Whenever equipped creature deals combat damage to a player, look at that many cards from the top of your library. You may exile a nonland card from among them. Put the rest on the bottom of your library in a random order. You may cast the exiled card without paying its mana cost.";

export default defineCard({
  name: "The Key to the Vault",
  manaCost: "{1}{U}",
  colors: ["U"],
  supertypes: ["legendary"],
  types: ["artifact"],
  subtypes: ["Equipment"],
  text: `${TEXT}\nEquip {2}{U}`,
  triggered: [
    {
      trigger: { on: "deals-combat-damage-to-player", who: "attached" },
      targets: [],
      effect: {
        kind: "look-and-choose",
        zone: "library",
        count: { triggerValue: true },
        min: 0,
        max: 1,
        filter: { notTypes: ["land"] },
        destination: "exile",
        unlinked: true,
        leftover: "bottom-random",
        then: { kind: "cast-now", target: 0, free: true },
      },
      resolve: null,
      text: TEXT,
    },
  ],
  activated: [equip("{2}{U}")],
});
