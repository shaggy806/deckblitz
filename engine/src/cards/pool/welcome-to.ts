import type { EffectSpec } from "../../effects.js";
import type { TargetSpec } from "../../target.js";
import { defineCard } from "../define.js";

// EDHREC rank 5663. Transforms into Jurassic Park.
//
// Rulings:
//   [2023-11-10] If Welcome to… leaves the battlefield before its first chapter ability
//     resolves, that ability will have no effect. The target noncreature artifacts won't become
//     Walls at all.
//
// - Chapter I is one optional slot per opponent seat (The True Scriptures'
//   shape). "Becomes a 0/4 Wall artifact creature" keeps the artifact's other
//   types and its subtypes that aren't creature types, and Wall replaces any
//   creature type it had (rule 205.1b — a kindred artifact's): `setSubtypes`.
//   The duration is read as it resolves:
//   with the Saga gone or no longer yours, nothing begins (rule 611.2b), and
//   it ends for good when the Saga leaves or changes hands — chapter III's
//   exile included, though by then the Walls are destroyed.
// - Chapter III returns it under your control whoever owns it, as Jurassic
//   Park.
const CHAPTER_I =
  "I — For each opponent, up to one target noncreature artifact they control becomes a 0/4 Wall artifact creature with defender " +
  "for as long as you control this Saga.";
const CHAPTER_II = "II — Create a 3/3 green Dinosaur creature token with trample. It gains haste until end of turn.";
const CHAPTER_III = "III — Destroy all Walls. Exile this Saga, then return it to the battlefield transformed under your control.";

const perOpponent = (seat: number): TargetSpec => ({
  kind: "optional",
  of: { kind: "permanent", whose: { seat }, filter: { type: "artifact", notTypes: ["creature"] } },
});

const wall = (target: number): EffectSpec => ({
  kind: "become",
  target,
  power: 0,
  toughness: 4,
  addTypes: ["artifact", "creature"],
  setSubtypes: ["Wall"],
  keywords: ["defender"],
  duration: "while-you-control-source",
});

export default defineCard({
  name: "Welcome to . . .",
  manaCost: "{1}{G}{G}",
  colors: ["G"],
  types: ["enchantment"],
  subtypes: ["Saga"],
  text: `(As this Saga enters and after your draw step, add a lore counter.)\n${CHAPTER_I}\n${CHAPTER_II}\n${CHAPTER_III}`,
  faces: ["Welcome to . . .", "Jurassic Park"],
  transform: true,
  chapters: [
    {
      at: [1],
      targets: [perOpponent(1), perOpponent(2), perOpponent(3)],
      effect: { kind: "sequence", effects: [wall(0), wall(1), wall(2)] },
      resolve: null,
      text: CHAPTER_I,
    },
    {
      at: [2],
      targets: [],
      effect: { kind: "create-token", token: "Dinosaur Token", count: 1, gainUntilEndOfTurn: ["haste"] },
      resolve: null,
      text: CHAPTER_II,
    },
    {
      at: [3],
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "destroy-all", filter: { subtype: "Wall" } },
          { kind: "flicker", target: "source", transformed: true, underYourControl: true },
        ],
      },
      resolve: null,
      text: CHAPTER_III,
    },
  ],
});
