import { defineCard } from "../define.js";
import { haunt } from "../helpers.js";

// Haunt (rule 702.55): exiled haunting a creature, its last ability
// triggers from exile when that creature dies.
//
// EDHREC rank 30567.
//
// Rulings:
//   [2006-02-01] If Night of Souls' Betrayal is on the battlefield when Graven Dominator's ability
//     resolves, all other creatures will become 0/0 and die.
//   [2009-10-01] The effect from the ability overwrites other effects that set power and/or
//     toughness if and only if those effects existed before the ability resolved. It will not
//     overwrite effects that modify power or toughness (whether from a static ability, counters,
//     or a resolved spell or ability), nor will it overwrite effects that set power and toughness
//     which come into existence after the ability resolves. Effects that switch the creature's
//     power and toughness are always applied after any other power or toughness changing effects,
//     including this one, regardless of the order in which they are created.

export default defineCard({
  name: "Graven Dominator",
  manaCost: "{4}{W}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Gargoyle"],
  power: 4,
  toughness: 4,
  keywords: ["flying"],
  text: "Flying\nHaunt (When this creature dies, exile it haunting target creature.)\nWhen this creature enters or the creature it haunts dies, each other creature has base power and toughness 1/1 until end of turn.",
  triggered: [
    haunt(),
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: {
        kind: "animate-all",
        filter: { type: "creature" },
        power: 1,
        toughness: 1,
        duration: "end-of-turn",
        exceptSource: true,
      },
      resolve: null,
      text: "When this creature enters or the creature it haunts dies, each other creature has base power and toughness 1/1 until end of turn.",
    },
    {
      trigger: { on: "haunted-dies" },
      sameAbilityAs: 1,
      targets: [],
      effect: {
        kind: "animate-all",
        filter: { type: "creature" },
        power: 1,
        toughness: 1,
        duration: "end-of-turn",
        exceptSource: true,
      },
      resolve: null,
      text: "When this creature enters or the creature it haunts dies, each other creature has base power and toughness 1/1 until end of turn.",
    },
  ],
});
