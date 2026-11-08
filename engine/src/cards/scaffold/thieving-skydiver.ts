import { defineCard } from "../define.js";

// SCAFFOLD — written by `npm run card:scaffold` from the Oracle snapshot. Not in the
// registry: author each TODO(scaffold), move this file into cards/pool/ (or
// tokens/), then run `npm run gen:cards -w engine`. See cards/AUTHORING.md.
// EDHREC rank 2429.
//
// Rulings:
//   [2020-09-25] Thieving Skydiver's ability can target an artifact you already control. You'll
//     attach it to Thieving Skydiver if it's an Equipment.
//   [2020-09-25] The control-change effect of Thieving Skydiver lasts indefinitely. It doesn't
//     wear off during the cleanup step, and it doesn't expire if Thieving Skydiver leaves the
//     battlefield. In a multiplayer game, it does expire if you leave the game.
//   [2020-09-25] If the Equipment can't be attached to Thieving Skydiver, most likely because
//     Thieving Skydiver has left the battlefield before its triggered ability resolves, the
//     Equipment remains attached to whatever it's currently attached to or remains unattached if
//     attached to nothing.
//   [2024-11-08] If a spell's kicker cost was paid, the spell is "kicked."
//   [2024-11-08] The kicker ability doesn't let you pay a kicker cost more than once.
//   [2024-11-08] To determine a spell's total cost, start with the mana cost (or an alternative
//     cost if another card's effect allows you to pay one instead), add any cost increases (such
//     as kicker), then apply any cost reductions. The spell's mana value remains unchanged, no
//     matter what the total cost to cast it was.
//   [2024-11-08] If you put a permanent with a kicker ability onto the battlefield without casting
//     it, you can't kick it.
//   [2024-11-08] If you copy a kicked spell on the stack, the copy is also kicked. If the copied
//     spell is a permanent spell, the token the copy of that spell becomes when it enters is also
//     kicked.
//   [2024-11-08] If a card or token enters as a copy of a permanent, the new permanent isn't
//     kicked, even if the original was.

export default defineCard({
  name: "Thieving Skydiver",
  manaCost: "{1}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Merfolk", "Rogue"],
  power: 2,
  toughness: 1,
  keywords: ["flying"],
  text: "Kicker {X}. X can't be 0. (You may pay an additional {X} as you cast this spell.)\nFlying\nWhen this creature enters, if it was kicked, gain control of target artifact with mana value X or less. If that artifact is an Equipment, attach it to this creature.",
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: null,
      resolve: null,
      text: "When this creature enters, if it was kicked, gain control of target artifact with mana value X or less. If that artifact is an Equipment, attach it to this creature.",
      condition: { kind: "self-kicked" },
      // TODO(scaffold): Gain control of target artifact with mana value X or less.
      // TODO(scaffold): If that artifact is an Equipment, attach it to ~.
    },
  ],
  // TODO(scaffold): Kicker {X}. X can't be 0.
});
