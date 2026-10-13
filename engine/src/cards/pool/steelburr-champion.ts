import { defineCard } from "../define.js";
import { offspringTrigger } from "../helpers.js";

// EDHREC rank 6976.
//
// Rulings:
//   [2024-07-26] In the rare case where the creature doesn't have the offspring ability when it
//     enters, the ability won't trigger even if you paid the offspring cost.
//   [2024-07-26] The token created by the offspring ability isn't "cast", so abilities that
//     trigger when a creature spell is cast won't trigger for the copy.
//   [2024-07-26] You can pay an offspring cost only once as you cast a spell with offspring. You
//     can't try to pay it multiple times to get more token copies.
//   [2024-07-26] If the spell resolves but the creature with offspring leaves the battlefield
//     before the offspring ability resolves, you'll still create a token copy of it.
//   [2024-07-26] The token copies exactly what was printed on the original creature and nothing
//     else, except it's a 1/1 (unless that creature is copying something else; see below). It
//     doesn't copy whether that creature is tapped or untapped, whether it has any counters on it
//     or Auras and Equipment attached to it, or any non-copy effects that have changed its types,
//     color, or so on.
//   [2024-07-26] Steelburr Champion's last ability resolves before the spell that caused it to
//     trigger. It resolves even if that spell is countered.
//
// Offspring (rule 702.175) is a `kicker` under its own keyword and
// `offspringTrigger()` (Iridescent Vinelasher): the 1/1 is a token copy of
// this card, not a token of its own.
const CAST_TEXT = "Whenever an opponent casts a noncreature spell, put a +1/+1 counter on this creature.";

export default defineCard({
  name: "Steelburr Champion",
  manaCost: "{2}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Mouse", "Soldier"],
  power: 1,
  toughness: 1,
  keywords: ["vigilance"],
  text:
    "Offspring {1}{W} (You may pay an additional {1}{W} as you cast this spell. If you do, when this creature enters, create a 1/1 token copy of it.)\nVigilance\n" +
    CAST_TEXT,
  kicker: { cost: "{1}{W}", keyword: "offspring" },
  triggered: [
    offspringTrigger(),
    {
      trigger: { on: "cast-spell", who: "opponent", noncreatureOnly: true },
      targets: [],
      effect: { kind: "add-counter", target: "source", counter: "+1/+1", amount: 1 },
      resolve: null,
      text: CAST_TEXT,
    },
  ],
});
