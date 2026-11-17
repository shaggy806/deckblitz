import { defineCard } from "../define.js";

// Rulings:
//   Abeyance does not affect abilities which are not activated, such as static abilities and
//     triggered abilities. It also doesn't stop the declaration of attackers or blockers.
//   Abeyance never prevents mana abilities from being activated.
//   Abeyance prohibits activated abilities of cards which are not on the battlefield.
//   This can't be used as a counterspell.
//
// One `prohibit` for the turn on the target player: casting instants and sorceries, and
// activating every ability but mana abilities (`except: ["mana"]`, rule 605.1a), in any zone
// (`anyZone` — cycling from the hand too, the third ruling). Hand to Hand's static words, as a
// one-shot (Revel in Silence's shape). Then Abeyance's controller draws.

export default defineCard({
  name: "Abeyance",
  manaCost: "{1}{W}",
  colors: ["W"],
  types: ["instant"],
  text:
    "Until end of turn, target player can't cast instant or sorcery spells, and that player can't activate abilities that aren't mana abilities.\nDraw a card.",
  targets: ["player"],
  effect: {
    kind: "sequence",
    effects: [
      {
        kind: "prohibit",
        prohibits: [
          { act: "cast", who: { target: 0 }, filter: { typesAnyOf: ["instant", "sorcery"] } },
          { act: "activate", who: { target: 0 }, except: ["mana"], anyZone: true },
        ],
      },
      { kind: "draw", amount: 1 },
    ],
  },
});
