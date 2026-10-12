import { defineCard } from "../define.js";

// EDHREC rank 7359.
// Makes Soldier → new token "Soldier Token (Fire Nation Attacks)" (scaffolded).
//
// Rulings:
//   [2025-10-02] You can cast a spell using flashback even if it was somehow put into your
//     graveyard without having been cast.
//   [2025-10-02] Any other mana you add during combat will still be lost as normal when moving
//     between steps of combat.
//   [2025-10-02] A spell cast using flashback will always be exiled afterward, whether it
//     resolves, is countered, or leaves the stack in some other way.
//   [2025-10-02] "Firebending N" is a keyword that represents the ability "Whenever this creature
//     attacks, add N {R}. Until end of combat, you don't lose this mana as steps end."
//   [2025-10-02] If a card with flashback is put into your graveyard during your turn, you can
//     cast it if it's legal to do so before any other player can take any actions.
//   [2025-10-02] To determine the total cost of a spell, start with the mana cost or alternative
//     cost (such as a flashback cost) you're paying, add any cost increases, then apply any cost
//     reductions. The mana value of the spell is determined only by its mana cost, no matter what
//     the total cost to cast the spell was.
//   [2025-10-02] Mana from firebending abilities isn't lost until you leave combat and go to your
//     second main phase. It can be used at any time during combat, even after combat damage has
//     been dealt.
//   [2025-10-02] Firebending abilities aren't mana abilities. They use the stack and can be
//     responded to.
//   [2025-10-02] Multiple instances of firebending on the same creature trigger separately, each
//     granting you the appropriate amount of mana.
//   [2025-10-02] You must still follow any timing restrictions and permissions, including those
//     based on the card's type. For instance, you can cast a sorcery using flashback only when you
//     could normally cast a sorcery.
//   [2025-10-02] "Flashback [cost]" means "You may cast this card from your graveyard by paying
//     [cost] rather than paying its mana cost" and "If the flashback cost was paid, exile this
//     card instead of putting it anywhere else any time it would leave the stack."

export default defineCard({
  name: "Fire Nation Attacks",
  manaCost: "{4}{R}",
  colors: ["R"],
  types: ["instant"],
  flashback: { cost: "{8}{R}" },
  text: "Create two 2/2 red Soldier creature tokens with firebending 1. (Whenever a creature with firebending 1 attacks, add {R}. This mana lasts until end of combat.)\nFlashback {8}{R} (You may cast this card from your graveyard for its flashback cost. Then exile it.)",
  effect: { kind: "create-token", token: "Soldier Token (Fire Nation Attacks)", count: 2 },
});
