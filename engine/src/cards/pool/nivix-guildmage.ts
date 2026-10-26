import { defineCard } from "../define.js";

// EDHREC rank 16565.
//
// Rulings:
//   [2012-10-01] When the second ability resolves, it creates a copy of a spell. That copy is
//     created on the stack, so it's not "cast." Abilities that trigger when a player casts a spell
//     won't trigger.
//   [2012-10-01] Nivix Guildmage's second ability can target (and copy) any instant or sorcery
//     spell you control, not just one with targets.
//   [2012-10-01] The copy will have the same targets as the spell it's copying unless you choose
//     new ones. You may change any number of the targets, including all of them or none of them.
//
// The copy ability is Gandalf the Grey's spell slot and `copy-spell`.

export default defineCard({
  name: "Nivix Guildmage",
  manaCost: "{U}{R}",
  colors: ["U", "R"],
  types: ["creature"],
  subtypes: ["Human", "Wizard"],
  power: 2,
  toughness: 2,
  text: "{1}{U}{R}: Draw a card, then discard a card.\n{2}{U}{R}: Copy target instant or sorcery spell you control. You may choose new targets for the copy.",
  activated: [
    {
      cost: { mana: "{1}{U}{R}", tap: false },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [{ kind: "draw", amount: 1 }, { kind: "discard", target: "you", amount: 1 }],
      },
      resolve: null,
      text: "{1}{U}{R}: Draw a card, then discard a card.",
    },
    {
      cost: { mana: "{2}{U}{R}", tap: false },
      targets: [{ kind: "spell", whose: "you", filter: { typesAnyOf: ["instant", "sorcery"] } }],
      effect: { kind: "copy-spell", target: 0, newTargets: true },
      resolve: null,
      text: "{2}{U}{R}: Copy target instant or sorcery spell you control. You may choose new targets for the copy.",
    },
  ],
});
