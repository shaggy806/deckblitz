import { defineCard } from "../define.js";

// EDHREC rank 26167. "You may collect evidence 6" is a kicker keyword
// (rule 701.59a), and "this spell costs {2} less to cast if evidence was
// collected" the kicked cast's own reduction, `reduceGeneric`, taken after
// any increase (601.2f), as Ice Out's is.
//
// Rulings:
//   - If either target is an illegal target as it resolves, the creature you
//     control won't deal damage.
//   - Without cards of total mana value 6 or more in your graveyard, you
//     can't choose to collect evidence at all.

export default defineCard({
  name: "Bite Down on Crime",
  manaCost: "{3}{G}",
  colors: ["G"],
  types: ["sorcery"],
  kicker: { cost: "", keyword: "collect-evidence", collectEvidence: 6, reduceGeneric: 2 },
  text: "As an additional cost to cast this spell, you may collect evidence 6. This spell costs {2} less to cast if evidence was collected. (To collect evidence 6, exile cards with total mana value 6 or greater from your graveyard.)\nTarget creature you control gets +2/+0 until end of turn. It deals damage equal to its power to target creature you don't control.",
  targets: ["creature-you-control", "creature-an-opponent-controls"],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "modify-pt", target: 0, power: 2, toughness: 0, duration: "end-of-turn" },
      { kind: "fight", a: 0, b: 1, oneSided: true },
    ],
  },
});
