import { defineCard } from "../define.js";
import { VOID_CONDITION, ward } from "../helpers.js";

// EDHREC rank 10630.
//
// Rulings:
//   [2025-07-25] If a player casts a spell for its warp cost but that spell is countered or
//     otherwise fails to resolve, that spell was still warped, so the condition required by void
//     abilities will be fulfilled for that turn.
//   [2025-07-25] Some void abilities are triggered abilities with intervening if clauses. If a
//     nonland permanent hasn’t left the battlefield during that turn or a spell wasn’t warped that
//     turn by the time the ability would trigger, it won’t trigger at all.
// "Defending player" is the attack trigger's player (the one Alpharael
// attacks, or that planeswalker's controller); the half is read from their
// life total as the trigger resolves.

const WARD_TEXT = "Ward—Discard a card at random.";
const ATTACK_TEXT =
  "Void — Whenever Alpharael attacks, if a nonland permanent left the battlefield this turn or a spell was warped this turn, defending player loses half their life, rounded up.";

export default defineCard({
  name: "Alpharael, Stonechosen",
  manaCost: "{3}{B}{B}",
  colors: ["B"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Cleric"],
  power: 3,
  toughness: 3,
  text: `${WARD_TEXT}\n${ATTACK_TEXT}`,
  triggered: [
    ward({ discard: 1, discardAtRandom: true }),
    {
      trigger: { on: "attacks", who: "self" },
      targets: [],
      condition: VOID_CONDITION,
      effect: { kind: "lose-life", who: "trigger-player", amount: { half: { lifeTotal: "each" }, round: "up" } },
      resolve: null,
      text: ATTACK_TEXT,
    },
  ],
});
