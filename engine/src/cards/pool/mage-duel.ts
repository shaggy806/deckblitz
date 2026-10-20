import { defineCard } from "../define.js";

// EDHREC rank 22278. Ruthless Predation's pump-then-fight; the reduction
// counts instant and sorcery spells cast before this one this turn (its own
// cast isn't one yet as its cost is determined). Both targets are required
// (the ruling); with either gone, no fight.

export default defineCard({
  name: "Mage Duel",
  manaCost: "{2}{G}",
  colors: ["G"],
  types: ["sorcery"],
  text: "This spell costs {2} less to cast if you've cast another instant or sorcery spell this turn.\nTarget creature you control gets +1/+2 until end of turn. Then it fights target creature you don't control. (Each deals damage equal to its power to the other.)",
  selfCostReduction: {
    condition: { kind: "cast-this-turn", who: "you", filter: { typesAnyOf: ["instant", "sorcery"] }, atLeast: 1 },
    reduceGeneric: 2,
  },
  targets: ["creature-you-control", "creature-an-opponent-controls"],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "modify-pt", target: 0, power: 1, toughness: 2, duration: "end-of-turn" },
      { kind: "fight", a: 0, b: 1 },
    ],
  },
});
