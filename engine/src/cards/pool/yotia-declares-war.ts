import { defineCard } from "../define.js";

const CHAPTER_I = "I — Create a 0/2 colorless Thopter artifact creature token with flying named Ornithopter.";
const CHAPTER_II =
  "II — Tap any number of untapped artifacts you control. When you do, this Saga deals that much damage to target creature or planeswalker.";
const CHAPTER_III =
  "III — Up to one target artifact you control becomes an artifact creature with base power and toughness 4/4 until end of turn.";
const UNTAPPED_ARTIFACTS = { type: "artifact", tapped: false, controlledBy: "you" } as const;

// Rulings (2022-09-09): chapter II taps first, then a reflexive ability
// triggers and targets — players respond knowing how many were tapped; tapping
// none still triggers it, for 0 damage.
export default defineCard({
  name: "Yotia Declares War",
  manaCost: "{1}{R}",
  colors: ["R"],
  types: ["enchantment"],
  subtypes: ["Saga"],
  text:
    "Read ahead (Choose a chapter and start with that many lore counters. Add one after your draw step. Skipped chapters don't trigger. Sacrifice after III.)\n" +
    `${CHAPTER_I}\n${CHAPTER_II}\n${CHAPTER_III}`,
  readAhead: true,
  chapters: [
    {
      at: [1],
      targets: [],
      effect: { kind: "create-token", token: "Ornithopter Token", count: 1 },
      resolve: null,
      text: CHAPTER_I,
    },
    {
      at: [2],
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          {
            kind: "choose-permanents",
            filter: UNTAPPED_ARTIFACTS,
            upTo: { countOf: UNTAPPED_ARTIFACTS },
            then: { kind: "tap", target: 0 },
            prompt: "Tap any number of untapped artifacts you control",
          },
          {
            kind: "reflexive-trigger",
            targets: [{ kind: "permanent", whose: "any", filter: { typesAnyOf: ["creature", "planeswalker"] } }],
            effect: { kind: "damage", amount: { triggerValue: true }, target: 0 },
            text: "When you do, this Saga deals that much damage to target creature or planeswalker.",
            value: { thisWay: "tapped" },
          },
        ],
      },
      resolve: null,
      text: CHAPTER_II,
    },
    {
      at: [3],
      targets: [{ kind: "optional", of: { kind: "permanent", whose: "you", filter: { type: "artifact" } } }],
      effect: {
        kind: "animate",
        target: 0,
        power: 4,
        toughness: 4,
        addTypes: ["artifact", "creature"],
        addSubtypes: [],
        duration: "end-of-turn",
      },
      resolve: null,
      text: CHAPTER_III,
    },
  ],
});
