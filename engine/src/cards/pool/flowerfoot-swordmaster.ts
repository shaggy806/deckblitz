import { defineCard } from "../define.js";
import { offspringTrigger, valiant } from "../helpers.js";

// EDHREC rank 12240.
// Makes a 1/1 token copy of itself (offspring — `offspringTrigger`'s create-token-copy).
//
// Rulings:
//   [2024-07-26] Valiant abilities will resolve before the spell or ability that caused them to
//     trigger.
//   [2024-07-26] In the rare case where the creature doesn't have the offspring ability when it
//     enters, the ability won't trigger even if you paid the offspring cost.
//   [2024-07-26] The token created by the offspring ability isn't "cast", so abilities that
//     trigger when a creature spell is cast won't trigger for the copy.
//   [2024-07-26] You can pay an offspring cost only once as you cast a spell with offspring. You
//     can't try to pay it multiple times to get more token copies.
//   [2024-07-26] If the spell is countered, the offspring ability will not trigger, and no token
//     will be created.
//   [2024-07-26] If the spell resolves but the creature with offspring leaves the battlefield
//     before the offspring ability resolves, you'll still create a token copy of it.
//   [2024-07-26] The token copies exactly what was printed on the original creature and nothing
//     else, except it's a 1/1 (unless that creature is copying something else).
//   [2024-07-26] Flowerfoot Swordmaster's last ability affects only Mice you control at the time
//     it resolves, including Flowerfoot Swordmaster itself (as long as it's still a Mouse at that
//     time.) Mice you begin to control later in the turn or creatures that become Mice later in
//     the turn won't be affected.
//   [2024-07-26] If a spell or ability you control has one or more of its targets changed to a
//     creature you control with a valiant ability, that ability will trigger if that creature
//     hasn't yet been the target of a spell or ability you control this turn.

const VALIANT_TEXT =
  "Valiant — Whenever this creature becomes the target of a spell or ability you control for the first time each turn, Mice you control get +1/+0 until end of turn.";

export default defineCard({
  name: "Flowerfoot Swordmaster",
  manaCost: "{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Mouse", "Soldier"],
  power: 1,
  toughness: 2,
  text: `Offspring {2} (You may pay an additional {2} as you cast this spell. If you do, when this creature enters, create a 1/1 token copy of it.)\n${VALIANT_TEXT}`,
  kicker: { cost: "{2}", keyword: "offspring" },
  triggered: [
    offspringTrigger(),
    // The Mice it affects are locked in as it resolves (the ruling).
    valiant(
      {
        kind: "modify-pt-all",
        filter: { type: "creature", subtype: "Mouse", controlledBy: "you" },
        power: 1,
        toughness: 0,
        duration: "end-of-turn",
      },
      VALIANT_TEXT,
    ),
  ],
});
