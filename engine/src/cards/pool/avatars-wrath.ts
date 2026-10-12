import { defineCard } from "../define.js";

// EDHREC rank 1556.
//
// Rulings: airbend's — its owner may cast each card from exile for {2} (an
// alternative cost: X is 0, additional costs still paid), a token exiled is
// gone, a land can't be played from there.
//
// One instruction exiles every other creature together (rule 603.10a). With
// a creature chosen and gone illegal by resolution, every target is illegal
// and the spell doesn't resolve at all (608.2b). The lock is the caster's
// effect over each opponent as it resolves, ending as the caster's next turn
// begins; it bars every cast from outside the hand — a commander, the
// creatures this airbended, a flashback.
const WRATH_TEXT = "Choose up to one target creature, then airbend all other creatures.";
const LOCK_TEXT = "Until your next turn, your opponents can't cast spells from anywhere other than their hands.";

export default defineCard({
  name: "Avatar's Wrath",
  manaCost: "{2}{W}{W}",
  colors: ["W"],
  types: ["sorcery"],
  exileOnResolve: true,
  text:
    `${WRATH_TEXT} (Exile them. While each one is exiled, its owner may cast it for {2} rather than its mana cost.)\n` +
    `${LOCK_TEXT}\nExile Avatar's Wrath.`,
  targets: [{ kind: "optional", of: "creature" }],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "exile-all", filter: { type: "creature" }, airbend: true, exceptTarget: 0 },
      { kind: "player-effect", duration: "until-your-next-turn", castOnlyFromHand: "each-opponent" },
    ],
  },
});
