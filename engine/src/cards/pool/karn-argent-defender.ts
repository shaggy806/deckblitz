import { defineCard } from "../define.js";

// EDHREC rank 22486.
//
// Rulings:
//   [2026-08-21] Replacement effects, such as a permanent entering the battlefield tapped or with
//     counters on it, are unaffected. Abilities that apply "as [this permanent] enters" are
//     replacement effects.
//   [2026-08-21] The trigger event doesn't have to specify artifacts or creatures entering the
//     battlefield. For example, Tireless Tracker has an ability that says "Whenever a land you
//     control enters, investigate." If an artifact land or creature land you control enters, that
//     ability won't trigger. If a nonartifact, noncreature land you control enters, the ability
//     will trigger.
//   [2026-08-21] Look at the permanent as it exists on the battlefield, taking into account
//     continuous effects, to determine whether any triggered abilities will trigger.
//   [2026-08-21] If Karn, Argent Defender and another artifact or creature enter the battlefield
//     at the same time, neither one will cause triggered abilities to trigger when they enter the
//     battlefield.
//
// Torpor Orb's static widened to artifacts: every player's abilities, the
// entering permanent's own included, matched against the permanent as it is
// on the battlefield.
const TEXT = "Artifacts and creatures entering the battlefield don't cause abilities to trigger.";

export default defineCard({
  name: "Karn, Argent Defender",
  manaCost: "{2}",
  colors: [],
  supertypes: ["legendary"],
  types: ["artifact", "creature"],
  subtypes: ["Golem"],
  power: 1,
  toughness: 3,
  text: TEXT,
  static: [
    {
      affects: { scope: "self" },
      suppressEntryTriggers: { who: "everyone", entering: { typesAnyOf: ["artifact", "creature"] } },
      text: TEXT,
    },
  ],
});
