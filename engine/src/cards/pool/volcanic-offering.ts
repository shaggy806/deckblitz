import { defineCard } from "../define.js";

// Four targets: the caster chooses the first land and the first creature, and
// the opponent they name as it's cast chooses the other two
// (`opponentChoosesTargets`, rule 601.2c) — each "you don't control", the
// caster's side, so any other player's will do. Each "target" is a word of
// its own, so the opponent may pick what the caster picked (601.2c).
const LAND = { kind: "permanent", filter: { type: "land", notSupertype: "basic", controlledBy: "opponent" } } as const;
const CREATURE = "creature-an-opponent-controls" as const;

export default defineCard({
  name: "Volcanic Offering",
  manaCost: "{4}{R}",
  colors: ["R"],
  types: ["instant"],
  text: "Destroy target nonbasic land you don't control and target nonbasic land of an opponent's choice you don't control.\nVolcanic Offering deals 7 damage to target creature you don't control and 7 damage to target creature of an opponent's choice you don't control.",
  targets: [LAND, LAND, CREATURE, CREATURE],
  opponentChoosesTargets: [1, 3],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "sequence", simultaneous: true, effects: [{ kind: "destroy", target: 0 }, { kind: "destroy", target: 1 }] },
      { kind: "damage", amount: 7, target: 2 },
      { kind: "damage", amount: 7, target: 3 },
    ],
  },
});
