import { defineCard } from "../define.js";
import { prowl } from "../helpers.js";

// EDHREC rank 22550.
//
// Rulings:
//   [2008-04-01] If a Goblin or Rogue you control deals combat damage to a player while Auntie's
//     Snitch is in your graveyard, you can return Auntie's Snitch to your hand, then you can cast
//     it for its prowl cost that turn.
//   [2008-04-01] The last ability will trigger only if Auntie's Snitch is in your graveyard at the
//     moment a Goblin or Rogue deals combat damage to a player. The ability will check again when
//     it tries to resolve. If Auntie's Snitch hasn't left the graveyard by this time, you may
//     return it to your hand.

export default defineCard({
  name: "Auntie's Snitch",
  manaCost: "{2}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Goblin", "Rogue"],
  power: 3,
  toughness: 1,
  text: "This creature can't block.\nProwl {1}{B} (You may cast this for its prowl cost if you dealt combat damage to a player this turn with a Goblin or Rogue.)\nWhenever a Goblin or Rogue you control deals combat damage to a player, if this card is in your graveyard, you may return this card to your hand.",
  alternativeCost: prowl("{1}{B}"),
  static: [
    {
      affects: { scope: "self" },
      restrictions: ["cant-block"],
      text: "This creature can't block.",
    },
  ],
  triggered: [
    {
      fromGraveyard: true,
      condition: { kind: "source-zone", zones: ["graveyard"], sameObject: true },
      trigger: {
        on: "deals-combat-damage-to-player",
        who: "you-control",
        filter: { type: "creature", anyOf: [{ subtype: "Goblin" }, { subtype: "Rogue" }] },
      },
      targets: [],
      effect: {
        kind: "may",
        prompt: "Return Auntie's Snitch to your hand?",
        effect: { kind: "return-to-hand", target: "source", from: "graveyard" },
      },
      resolve: null,
      text: "Whenever a Goblin or Rogue you control deals combat damage to a player, if this card is in your graveyard, you may return this card to your hand.",
    },
  ],
});
