import { defineCard } from "../define.js";

// EDHREC rank 19854.
//
// The Puca copies the creature as it last existed on the battlefield — its
// printed values plus any copy effects on it, a token's as the effect that
// made it said (the rulings) — so not `ofCard`. No duration (rule 611.2a); a
// later copy overwrites it. "This ability" is a copiable exception (rule
// 707.9b), so it keeps triggering as whatever it copies.
//
// Rulings:
//   [2008-05-01] If Cemetery Puca becomes a copy of a token, it copies the original
//     characteristics of that token as stated by the effect that put it onto the battlefield. It
//     does not become a token.
//   [2008-05-01] This effect has no duration. If you use the ability, Cemetery Puca will remain a
//     copy of the creature until it leaves the battlefield or you use the ability again.
//   [2008-05-01] It won't copy counters on the creature (it'll just retain the counters it
//     already has).
//   [2008-05-01] Cemetery Puca's ability isn't targeted. It can copy a creature with shroud or
//     protection.
const TEXT =
  "Whenever a creature dies, you may pay {1}. If you do, this creature becomes a copy of that creature, except it has this ability.";

export default defineCard({
  name: "Cemetery Puca",
  manaCost: "{1}{U/B}{U/B}",
  colors: ["U", "B"],
  types: ["creature"],
  subtypes: ["Shapeshifter"],
  power: 1,
  toughness: 2,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "dies", who: "any", filter: { type: "creature" } },
      targets: [],
      effect: {
        kind: "may",
        prompt: "Pay {1} to have Cemetery Puca become a copy of that creature?",
        cost: "{1}",
        effect: {
          kind: "become-copy",
          target: "source",
          of: "trigger-object",
          exceptions: { thisAbility: { card: "Cemetery Puca", triggered: 0 } },
        },
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
