import { defineCard } from "../define.js";

// EDHREC rank 22256.
//
// The damage becomes the exile (`instead: { effect }`, rules 614.1a, 614.6 —
// Dralnu's shape): no damage is dealt, so no life is lost and nothing that
// triggers on damage sees any, and none is prevented, so damage that can't be
// prevented (615.12) is replaced all the same. Every player's damage, the
// permanent's controller's too (the ruling); "that player" is the one the
// damage would have been dealt to (`"trigger-player"`), "that many" the damage
// (`"x"`). With fewer cards in the library, what's there is exiled, and with
// none the damage simply has no effect (the ruling).

const TEXT = "If damage would be dealt to a player, that player exiles that many cards from the top of their library instead.";

export default defineCard({
  name: "Crumbling Sanctuary",
  manaCost: "{5}",
  colors: [],
  types: ["artifact"],
  text: TEXT,
  static: [
    {
      affects: { scope: "self" },
      replacement: {
        event: "would-deal-damage",
        instead: { effect: { kind: "exile-from-library", whose: "trigger-player", amount: "x" } },
        to: "player",
      },
      text: TEXT,
    },
  ],
});
