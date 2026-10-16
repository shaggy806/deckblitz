import { defineCard } from "../define.js";

// EDHREC rank 23608. Survival is Reluctant Role Model's trigger: the second
// main phase (`turn-structure`), an intervening "if" on the source being
// tapped (read as it last existed if it has left). The land becomes a 0/0
// Elemental creature for good — no duration (the ruling) — with Nissa, Vital
// Force's animate, and gains haste until your next turn.
//
// Rulings:
//   If a creature's survival ability triggers but that creature is untapped when the ability
//     begins to resolve, that ability won't do anything.
//   If a creature's survival ability triggers but the creature leaves the battlefield before the
//     ability resolves, use its tapped or untapped status as it last existed on the battlefield to
//     determine whether or not the ability will do anything.
//   Survival abilities (and other abilities that trigger at the beginning of your second main
//     phase) will trigger at the beginning of the second main phase you take in a turn. They won't
//     trigger during your third, fourth, or other additional main phases in a single turn, if
//     effects somehow cause you to have more than two main phases.
//   Rootwise Survivor's last ability doesn't have a duration, which means the land remains a
//     creature indefinitely.
//   If a creature with a survival ability isn't tapped when your second main phase begins, the
//     ability won't trigger at all. You won't be able to tap it during your second main phase in
//     time to have that ability trigger.
const SURVIVAL_TEXT =
  "Survival — At the beginning of your second main phase, if this creature is tapped, put three +1/+1 counters on up to one target land you control. That land becomes a 0/0 Elemental creature in addition to its other types. It gains haste until your next turn.";

export default defineCard({
  name: "Rootwise Survivor",
  manaCost: "{3}{G}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Human", "Survivor"],
  power: 3,
  toughness: 4,
  keywords: ["haste"],
  text: `Haste\n${SURVIVAL_TEXT}`,
  triggered: [
    {
      trigger: { on: "step-begins", step: "postcombat-main", who: "you" },
      condition: {
        kind: "all",
        of: [
          { kind: "turn-structure", mainPhase: 2 },
          { kind: "source", filter: { tapped: true } },
        ],
      },
      targets: [{ kind: "optional", of: "land-you-control" }],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "add-counter", target: 0, counter: "+1/+1", amount: 3 },
          {
            kind: "animate",
            target: 0,
            power: 0,
            toughness: 0,
            addTypes: ["creature"],
            addSubtypes: ["Elemental"],
            duration: "permanent",
          },
          { kind: "grant-keyword", target: 0, keyword: "haste", duration: "until-your-next-turn" },
        ],
      },
      resolve: null,
      text: SURVIVAL_TEXT,
    },
  ],
});
