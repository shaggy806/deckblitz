import { defineCard } from "../define.js";

// EDHREC rank 7715.
//
// Rulings:
//   [2020-11-10] A land that becomes a creature because of the first mode will retain any other
//     supertypes, card types, subtypes, and abilities it had.
//   [2020-11-10] If you choose both modes, the effects happen in the listed order. The lands will
//     become 1/1 creatures in time to deal damage to the target of the second mode.
//   [2020-11-10] Once you've chosen both modes for the spell, it doesn't matter whether you
//     continue to control a commander. This is true even if you somehow no longer control a
//     commander as you finish casting the spell.
//   [2020-11-10] Even though the card is named after a specific character, controlling any
//     commander will satisfy its condition.
//   [2020-11-10] If some but not all of the targets become illegal, Kamahl's Will will resolve but
//     have no effect on illegal targets. If the target of the second mode becomes illegal, no
//     damage will be dealt.
//   [2020-11-10] Once you've announced that you're casting a spell, players can't take any actions
//     until you've finished doing so. Notably, opponents can't try to remove your commander to
//     change how many modes you may choose.
//   [2020-11-10] The commander you control doesn't have to be your commander.
//   [2020-11-10] There's no extra bonus if you control more than one commander.

// With both modes the lands' group comes before the creature's slot, so its
// members end at an empty slot (`targetSpans`), and the modes apply in the
// listed order: the lands are creatures by the time the damage is dealt.
export default defineCard({
  name: "Kamahl's Will",
  manaCost: "{3}{G}",
  colors: ["G"],
  types: ["instant"],
  text: "Choose one. If you control a commander as you cast this spell, you may choose both instead.\n• Until end of turn, any number of target lands you control become 1/1 Elemental creatures with vigilance, indestructible, and haste. They're still lands.\n• Choose target creature you don't control. Each creature you control deals damage equal to its power to that creature.",
  castModal: {
    minModes: 1,
    maxModes: 1,
    maxModesIf: { condition: { kind: "controls", filter: { isCommander: true }, atLeast: 1 }, maxModes: 2 },
    modes: [
      {
        text: "Until end of turn, any number of target lands you control become 1/1 Elemental creatures with vigilance, indestructible, and haste. They're still lands.",
        targets: [{ kind: "any-number", of: "land-you-control" }],
        effect: {
          kind: "for-each-target",
          from: 0,
          simultaneous: true,
          effect: {
            kind: "become",
            target: 0,
            power: 1,
            toughness: 1,
            addTypes: ["creature"],
            addSubtypes: ["Elemental"],
            keywords: ["vigilance", "indestructible", "haste"],
            duration: "end-of-turn",
          },
        },
      },
      {
        text: "Choose target creature you don't control. Each creature you control deals damage equal to its power to that creature.",
        targets: ["creature-an-opponent-controls"],
        effect: {
          kind: "each-deals-damage",
          filter: { type: "creature", controlledBy: "you" },
          amount: "its-power",
          to: 0,
        },
      },
    ],
  },
});
