import { defineCard } from "../define.js";
import { offspringTrigger } from "../helpers.js";

// EDHREC rank 11180.
//
// Rulings:
//   [2024-07-26] If the spell resolves but the creature with offspring leaves the battlefield
//     before the offspring ability resolves, you’ll still create a token copy of it.
//   [2024-07-26] In the rare case where the original creature is copying something else when the
//     offspring ability resolves, the token enters as whatever that creature copied, except it’s a
//     1/1.
//   [2024-07-26] If the spell is countered, the offspring ability will not trigger, and no token
//     will be created.
//   [2024-07-26] Any “enters” abilities of the copied creature will trigger when the token enters.
//     Any “as [this creature] enters” or “[this creature] enters with” abilities of the copied
//     creature will also work.
//   [2024-07-26] In the rare case where the creature doesn’t have the offspring ability when it
//     enters, the ability won’t trigger even if you paid the offspring cost.
//   [2024-07-26] You can pay an offspring cost only once as you cast a spell with offspring. You
//     can’t try to pay it multiple times to get more token copies.
//   [2024-07-26] The token copies exactly what was printed on the original creature and nothing
//     else, except it’s a 1/1 (unless that creature is copying something else; see below). It
//     doesn’t copy whether that creature is tapped or untapped, whether it has any counters on it
//     or Auras and Equipment attached to it, or any non-copy effects that have changed its types,
//     color, or so on.
//   [2024-07-26] The token created by the offspring ability isn’t “cast”, so abilities that
//     trigger when a creature spell is cast won’t trigger for the copy.
//   [2024-07-26] Many creatures with offspring abilities have other abilities that refer to them
//     as “this creature” rather than referring to them by name. This difference is for clarity
//     purposes and does not change the function of any of these abilities.
//
// Offspring is `kicker.keyword: "offspring"` with `offspringTrigger()`
// (Iridescent Vinelasher). "Your choice of double strike or trample" is made
// as the trigger resolves: a `modal` effect over its one target (Steel
// Seraph's shape).

const COMBAT_TEXT =
  "At the beginning of combat on your turn, target Mouse you control gains your choice of double strike or trample until end of turn.";

export default defineCard({
  name: "Manifold Mouse",
  manaCost: "{1}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Mouse", "Soldier"],
  power: 1,
  toughness: 2,
  text:
    "Offspring {2} (You may pay an additional {2} as you cast this spell. If you do, when this " +
    "creature enters, create a 1/1 token copy of it.)\n" +
    COMBAT_TEXT,
  kicker: { cost: "{2}", keyword: "offspring" },
  triggered: [
    offspringTrigger(),
    {
      trigger: { on: "step-begins", step: "begin-combat", who: "you" },
      targets: [{ kind: "permanent", whose: "you", filter: { subtype: "Mouse" } }],
      effect: {
        kind: "modal",
        minModes: 1,
        maxModes: 1,
        modes: [
          {
            text: "Double strike",
            effect: { kind: "grant-keyword", target: 0, keyword: "double-strike", duration: "end-of-turn" },
          },
          {
            text: "Trample",
            effect: { kind: "grant-keyword", target: 0, keyword: "trample", duration: "end-of-turn" },
          },
        ],
      },
      resolve: null,
      text: COMBAT_TEXT,
    },
  ],
});
