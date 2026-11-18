import { defineCard } from "../define.js";

// EDHREC rank 14558.
//
// Rulings this follows: a spell whose every target is the same nonland
// permanent an opponent controls triggers it, if another opponent — not that
// permanent's controller — controls a nonland permanent the spell could
// target (asked again as it resolves: with none left it does nothing). The
// copy's every target is the one chosen (rule 707.10e); it's made even if the
// spell was countered in response, keeps its modes, X and paid costs (a
// kicked spell's copy is kicked), isn't cast, and resolves first.
const COPY =
  "Whenever you cast an instant or sorcery spell that targets only a single nonland permanent an opponent " +
  "controls, if another opponent controls one or more nonland permanents that spell could target, choose one of " +
  "those permanents. Copy that spell. The copy targets the chosen permanent.";
const REGENERATE = "{1}{B}: Regenerate this creature.";

const AIMS = { of: "other-opponents", filter: { notTypes: ["land"] }, couldTarget: true } as const;

export default defineCard({
  name: "Exterminator Magmarch",
  manaCost: "{2}{B}{R}",
  colors: ["B", "R"],
  types: ["artifact", "creature"],
  subtypes: ["Phyrexian", "Construct"],
  power: 5,
  toughness: 3,
  text: `${COPY}\n${REGENERATE}`,
  triggered: [
    {
      trigger: {
        on: "cast-spell",
        who: "you",
        filter: {
          typesAnyOf: ["instant", "sorcery"],
          targets: { only: true, single: true, permanent: { notTypes: ["land"], controlledBy: "opponent" } },
        },
      },
      condition: { kind: "amounts", left: { copyAims: AIMS }, op: "gte", right: 1 },
      targets: [],
      effect: { kind: "copy-spell", target: "trigger-spell", retargetToChosen: AIMS },
      resolve: null,
      text: COPY,
    },
  ],
  activated: [
    {
      cost: { mana: "{1}{B}", tap: false },
      targets: [],
      effect: { kind: "regenerate", target: "source" },
      resolve: null,
      text: REGENERATE,
    },
  ],
});
