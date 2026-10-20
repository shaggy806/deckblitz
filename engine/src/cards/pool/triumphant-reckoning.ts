import { defineCard } from "../define.js";

// EDHREC rank 11303. Commander Legends (CMR). Brilliant Restoration's shape,
// planeswalkers too. Auras returned this way choose what they enchant as they
// enter, and one with nothing to enchant stays in the graveyard (the rulings,
// as for Replenish).
//
// Rulings:
//   [2020-11-10] An Aura returning to the battlefield this way can't be attached to anything else
//     entering the battlefield at the same time. If it enchants a permanent, you have to choose
//     one already on the battlefield.
//   [2020-11-10] If you return an Aura card to the battlefield this way, the Aura isn't being
//     cast, so you choose what it will enchant as is enters the battlefield. An Aura returned this
//     way doesn't target anything (so it could be attached to an opponent's permanent with
//     hexproof, for example), but the Aura's enchant ability restricts what it can be attached to.
//     If the Aura can't legally be attached to anything, it remains in the graveyard.

export default defineCard({
  name: "Triumphant Reckoning",
  manaCost: "{6}{W}{W}{W}",
  colors: ["W"],
  types: ["sorcery"],
  text: "Return all artifact, enchantment, and planeswalker cards from your graveyard to the battlefield.",
  targets: [],
  effect: {
    kind: "return-from-graveyard",
    filter: { typesAnyOf: ["artifact", "enchantment", "planeswalker"] },
    destination: "battlefield",
    count: "all",
  },
});
