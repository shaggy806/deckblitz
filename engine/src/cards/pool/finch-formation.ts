import { defineCard } from "../define.js";
import { offspringTrigger } from "../helpers.js";

// EDHREC rank 19262.
// Makes Finch Formation → new token "Finch Formation Token" (scaffolded).
//
// Rulings:
//   [2024-07-26] If the spell is countered, the offspring ability will not trigger, and no token
//     will be created.
//   [2024-07-26] The token copies exactly what was printed on the original creature and nothing
//     else, except it’s a 1/1 (unless that creature is copying something else; see below). It
//     doesn’t copy whether that creature is tapped or untapped, whether it has any counters on it
//     or Auras and Equipment attached to it, or any non-copy effects that have changed its types,
//     color, or so on.
//   [2024-07-26] In the rare case where the creature doesn’t have the offspring ability when it
//     enters, the ability won’t trigger even if you paid the offspring cost.
//   [2024-07-26] Many creatures with offspring abilities have other abilities that refer to them
//     as “this creature” rather than referring to them by name. This difference is for clarity
//     purposes and does not change the function of any of these abilities.
//   [2024-07-26] You can pay an offspring cost only once as you cast a spell with offspring. You
//     can’t try to pay it multiple times to get more token copies.
//   [2024-07-26] Any “enters” abilities of the copied creature will trigger when the token enters.
//     Any “as [this creature] enters” or “[this creature] enters with” abilities of the copied
//     creature will also work.
//   [2024-07-26] The token created by the offspring ability isn’t “cast”, so abilities that
//     trigger when a creature spell is cast won’t trigger for the copy.
//   [2024-07-26] If the spell resolves but the creature with offspring leaves the battlefield
//     before the offspring ability resolves, you’ll still create a token copy of it.
//   [2024-07-26] In the rare case where the original creature is copying something else when the
//     offspring ability resolves, the token enters as whatever that creature copied, except it’s a
//     1/1.

const ENTER_TEXT = "When this creature enters, target creature you control gains flying until end of turn.";

export default defineCard({
  name: "Finch Formation",
  manaCost: "{2}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Bird", "Scout"],
  power: 2,
  toughness: 2,
  keywords: ["flying"],
  text:
    "Offspring {3} (You may pay an additional {3} as you cast this spell. If you do, when this creature enters, create a 1/1 token copy of it.)\n" +
    `Flying\n${ENTER_TEXT}`,
  kicker: { cost: "{3}", keyword: "offspring" },
  triggered: [
    offspringTrigger(),
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: ["creature-you-control"],
      effect: { kind: "grant-keyword", target: 0, keyword: "flying", duration: "end-of-turn" },
      resolve: null,
      text: ENTER_TEXT,
    },
  ],
});
