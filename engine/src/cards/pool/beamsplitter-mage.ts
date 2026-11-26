import { defineCard } from "../define.js";

// EDHREC rank 21525.
//
// Rulings this follows: a spell whose every target is Beamsplitter Mage,
// however many slots that is, triggers it, if you control another creature
// that spell could target — asked again as it resolves, when with none left
// it does nothing. You choose one of them (not a target) and the copy's every
// target is that creature (rule 707.10e). The spell is copied even if the
// Mage has left or the spell was countered; the copy keeps the original's
// modes, X and paid costs, isn't cast, and resolves first.
const COPY =
  "Whenever you cast an instant or sorcery spell that targets only this creature, if you control one or more " +
  "other creatures that spell could target, choose one of those creatures. Copy that spell. The copy targets the " +
  "chosen creature.";

const AIMS = { of: "you", filter: { type: "creature" }, other: true, couldTarget: true } as const;

export default defineCard({
  name: "Beamsplitter Mage",
  manaCost: "{U}{R}",
  colors: ["U", "R"],
  types: ["creature"],
  subtypes: ["Vedalken", "Wizard"],
  power: 2,
  toughness: 2,
  text: COPY,
  triggered: [
    {
      trigger: {
        on: "cast-spell",
        who: "you",
        filter: { typesAnyOf: ["instant", "sorcery"], targets: { only: true, source: true } },
      },
      condition: { kind: "amounts", left: { copyAims: AIMS }, op: "gte", right: 1 },
      targets: [],
      effect: { kind: "copy-spell", target: "trigger-spell", retargetToChosen: AIMS },
      resolve: null,
      text: COPY,
    },
  ],
});
