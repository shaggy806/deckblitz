import { defineCard } from "../define.js";

// Commander 2021 (C21). EDHREC rank 11213.
//
// The target is a spell or an ability whose every target is one permanent or
// one player (the ruling: several targets, all the same one, will do). The
// copies are `copy-spell`'s `forEachItCouldTarget` on that slot, with
// players, less the one it targets (rule 707.10d): an ability in the slot is
// copied the way `copy-ability`'s is. "Could target" is judged as the spell's
// or ability's controller would choose it; the copies are yours, and you
// order them — with players among them, a copy at a time.
//
// Rulings:
//   - You copy the spell or ability for every permanent or player it could target. That is, you
//     don't choose either permanents or players and then make copies based on that.
//   - You control all the copies, and you'll choose which copy targets which permanent or player.
//     For example, if the original spell says, "Destroy target creature," you'll ultimately
//     choose the order in which each creature targeted by a copy is destroyed. Remember that the
//     original spell or ability will resolve after all of the copies.
//   - Each copy you create will cause your magecraft abilities to trigger.
//   - You can choose a spell or ability with multiple targets as long as all of those targets are
//     the same permanent or player.

const TEXT =
  "When this creature enters, if you cast it from your hand, choose target spell or ability that targets only a single permanent or player. Copy that spell or ability for each other permanent or player the spell or ability could target. Each copy targets a different one of those permanents and players.";

export default defineCard({
  name: "Radiant Performer",
  manaCost: "{3}{R}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Human", "Wizard"],
  power: 2,
  toughness: 2,
  keywords: ["flash"],
  text: `Flash\n${TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      condition: { kind: "source", filter: { cast: true, castBy: "you", castFrom: "hand" } },
      targets: [
        {
          kind: "stack",
          spells: "any",
          abilities: true,
          targeting: { only: true, single: true, permanent: {}, player: "any" },
        },
      ],
      effect: {
        kind: "copy-spell",
        target: 0,
        forEachItCouldTarget: { filter: {}, players: true, other: "targeted" },
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
