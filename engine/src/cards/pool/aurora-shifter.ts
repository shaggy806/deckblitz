import { defineCard } from "../define.js";

// EDHREC rank 7793. Modern Horizons 3 Commander.
//
// Rulings:
//   [2024-06-07] The target is chosen for a reflexive ability that triggers when you pay {E}{E},
//     not as the first ability triggers.
//   [2024-06-07] It copies exactly what was printed on the creature (or what that creature
//     copies), with the listed exception; not its counters, tapped state or attachments. It isn't
//     entering, so no enters ability of what it copies applies.
//
// The {E}{E} is a `may`'s `costEnergy`, and "when you do" a reflexive
// trigger (Matt Murdock, Justice Seeker's shape). The copy has no duration
// (rule 611.2a); "this ability" is `thisAbility` (Lazav's), and the combat
// damage ability a copiable `triggered` exception (rule 707.9a).
const DAMAGE_TEXT = "Whenever this creature deals combat damage to a player, you get that many {E}.";
const COPY_TEXT =
  'At the beginning of combat on your turn, you may pay {E}{E}. When you do, this creature becomes a copy of another target creature you control, except it has this ability and "Whenever this creature deals combat damage to a player, you get that many {E}."';

const DAMAGE = {
  trigger: { on: "deals-combat-damage-to-player", who: "self" },
  targets: [],
  effect: { kind: "get-energy", amount: { triggerValue: true } },
  resolve: null,
  text: DAMAGE_TEXT,
} as const;

export default defineCard({
  name: "Aurora Shifter",
  manaCost: "{1}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Shapeshifter"],
  power: 1,
  toughness: 3,
  text: `${DAMAGE_TEXT}\n${COPY_TEXT}`,
  triggered: [
    DAMAGE,
    {
      trigger: { on: "step-begins", step: "begin-combat", who: "you" },
      targets: [],
      effect: {
        kind: "may",
        prompt: "Pay {E}{E} to have this creature become a copy of another target creature you control?",
        costEnergy: 2,
        effect: {
          kind: "reflexive-trigger",
          targets: [{ kind: "other", of: "creature-you-control" }],
          effect: {
            kind: "become-copy",
            target: "source",
            of: 0,
            exceptions: {
              thisAbility: { card: "Aurora Shifter", triggered: 1 },
              triggered: [DAMAGE],
            },
          },
          text: 'When you do, this creature becomes a copy of another target creature you control, except it has this ability and "Whenever this creature deals combat damage to a player, you get that many {E}."',
        },
      },
      resolve: null,
      text: COPY_TEXT,
    },
  ],
});
