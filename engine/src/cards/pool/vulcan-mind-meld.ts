import { defineCard } from "../define.js";

// EDHREC rank 32300.
//
// The opponent's half is done as them (`as-player`): they look at the top
// card of the caster's library ({ controllerOf: "source" } — the spell's controller)
// and exile it face down, and the permission to play it is theirs.

export default defineCard({
  name: "Vulcan Mind-Meld",
  manaCost: "{U}",
  colors: ["U"],
  types: ["sorcery"],
  text: "Target opponent looks at the top card of your library, then exiles it face down. You look at the top two cards of their library, then exile them face down. For each card exiled this way, the player who exiled it may play it for as long as it remains exiled. Mana of any type can be spent to cast spells this way.",
  targets: ["opponent"],
  effect: {
    kind: "sequence",
    effects: [
      {
        kind: "as-player",
        who: { target: 0 },
        effect: {
          kind: "impulse-exile",
          amount: 1,
          whose: { controllerOf: "source" },
          duration: "while-exiled",
          faceDown: true,
          spendAs: "any-type",
          play: true,
        },
      },
      {
        kind: "impulse-exile",
        amount: 2,
        whose: 0,
        duration: "while-exiled",
        faceDown: true,
        spendAs: "any-type",
        play: true,
      },
    ],
  },
});
