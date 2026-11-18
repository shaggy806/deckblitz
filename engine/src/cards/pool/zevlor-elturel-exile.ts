import { defineCard } from "../define.js";

// EDHREC rank 13560; top-commanders rank 719.
//
// Rulings this follows: the delayed trigger (Cursed Recording's shape, this
// turn only) fires on a spell whose every target is the same one opponent or
// one permanent an opponent controls — a spell with more targets chosen
// doesn't (the Oracle update added "only"), one with an unused "up to one"
// slot does, and its copies have that one target too. For each other
// opponent, in turn order, its controller chooses that player or any
// permanent they control (the choice isn't targeting); one the spell can't
// target makes no copy. The copies are made even if the spell was countered
// in response, keep its modes, X and paid costs, aren't cast, and resolve
// first. `retargetToChosen` (rule 707.10e).
const COPY =
  "{2}, {T}: When you next cast an instant or sorcery spell that targets only a single opponent or a single " +
  "permanent an opponent controls this turn, for each other opponent, choose that player or a permanent they " +
  "control, copy that spell, and the copy targets the chosen player or permanent.";

export default defineCard({
  name: "Zevlor, Elturel Exile",
  manaCost: "{1}{U}{B}{R}",
  colors: ["U", "B", "R"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Tiefling", "Warrior"],
  power: 4,
  toughness: 2,
  keywords: ["haste"],
  text: `Haste\n${COPY}`,
  activated: [
    {
      cost: { mana: "{2}", tap: true },
      targets: [],
      effect: {
        kind: "delayed-trigger",
        at: {
          nextSpell: {
            typesAnyOf: ["instant", "sorcery"],
            targets: { only: true, single: true, player: "opponent", permanent: { controlledBy: "opponent" } },
          },
        },
        effect: {
          kind: "copy-spell",
          target: "trigger-spell",
          retargetToChosen: { of: "other-opponents", filter: {}, players: true, eachPlayer: true },
        },
        text:
          "For each other opponent, choose that player or a permanent they control, copy that spell, and the copy " +
          "targets the chosen player or permanent.",
      },
      resolve: null,
      text: COPY,
    },
  ],
});
