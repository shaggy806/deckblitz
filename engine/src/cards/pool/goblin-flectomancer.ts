import { defineCard } from "../define.js";

// Guildpact (GPT). EDHREC rank 23103.
//
// "Change the targets": every target to another legal one, or none (the
// second ruling) — `how: "change"`, made optional by "you may". Any instant or
// sorcery spell may be targeted, with targets or without (the first ruling).
//
// Rulings:
//   [2006-02-01] The ability can target any instant or sorcery spell, even if it has no targets.
//   [2006-02-01] If the spell has multiple targets, you may either change all the targets or none
//     of them. Each target is treated individually, and must be changed to a different legal
//     target. If changing one of the targets would be impossible, then you can't change any of
//     the others.
//   [2006-02-01] If a spell has a variable number of targets (such as Electrolyze), the number of
//     targets chosen can't be changed.

const TEXT = "Sacrifice this creature: You may change the targets of target instant or sorcery spell.";

export default defineCard({
  name: "Goblin Flectomancer",
  manaCost: "{U}{R}{R}",
  colors: ["U", "R"],
  types: ["creature"],
  subtypes: ["Goblin", "Wizard"],
  power: 2,
  toughness: 2,
  text: TEXT,
  activated: [
    {
      cost: { mana: null, tap: false, sacrifice: "self" },
      targets: [{ kind: "stack", spells: "instant-or-sorcery", abilities: false }],
      effect: { kind: "change-targets", target: 0, how: "change", optional: true },
      resolve: null,
      text: TEXT,
    },
  ],
});
