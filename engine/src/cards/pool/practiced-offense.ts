import { defineCard } from "../define.js";

// EDHREC rank 9409.
//
// Rulings:
//   [2026-03-20] "Flashback [cost]" means "You may cast this card from your graveyard if the
//     resulting spell is an instant or sorcery spell by paying [cost] rather than paying its mana
//     cost" and "If the flashback cost was paid, exile this card instead of putting it anywhere
//     else any time it would leave the stack."
//   [2026-03-20] You can cast a spell using flashback even if it was somehow put into your
//     graveyard without having been cast.
//   [2026-03-20] To determine the total cost of a spell, start with the mana cost or alternative
//     cost (such as a flashback cost) you're paying, add any cost increases, then apply any cost
//     reductions. The mana value of the spell is determined only by its mana cost, no matter what
//     the total cost to cast the spell was.
//   [2026-03-20] If a card with flashback is put into your graveyard during your turn, you can
//     cast it if it's legal to do so before any other player can take any actions.
//   [2026-03-20] A spell cast using flashback will always be exiled afterward, whether it
//     resolves, is countered, or leaves the stack in some other way.
//   [2026-03-20] You must still follow any timing restrictions and permissions, including those
//     based on the card's type. For instance, you can cast a sorcery using flashback only when you
//     could normally cast a sorcery.

// Two targets, each its own instruction: the player whose creatures get the
// counters, then the creature that gains the keyword — chosen as it resolves
// (an unannounced `modal`, Orcish Medicine's shape). Each half still happens
// if only the other's target has gone illegal (rule 608.2b).
export default defineCard({
  name: "Practiced Offense",
  manaCost: "{2}{W}",
  colors: ["W"],
  types: ["sorcery"],
  flashback: { cost: "{1}{W}" },
  text: "Put a +1/+1 counter on each creature target player controls. Target creature gains your choice of double strike or lifelink until end of turn.\nFlashback {1}{W} (You may cast this card from your graveyard for its flashback cost. Then exile it.)",
  targets: ["player", "creature"],
  effect: {
    kind: "sequence",
    effects: [
      {
        kind: "add-counter-all",
        filter: { type: "creature", controlledBy: "you" },
        counter: "+1/+1",
        amount: 1,
        controlledByTarget: 0,
      },
      {
        kind: "modal",
        minModes: 1,
        maxModes: 1,
        modes: [
          {
            text: "Double strike",
            effect: { kind: "grant-keyword", target: 1, keyword: "double-strike", duration: "end-of-turn" },
          },
          {
            text: "Lifelink",
            effect: { kind: "grant-keyword", target: 1, keyword: "lifelink", duration: "end-of-turn" },
          },
        ],
      },
    ],
  },
});
