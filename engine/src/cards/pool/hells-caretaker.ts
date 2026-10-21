import { defineCard } from "../define.js";

// Legends. EDHREC rank 9561.
//
// Rulings:
//   Hell's Caretaker can be the creature sacrificed to activate its ability, but it can't be
//   the target of its own ability.
//
// Targets are chosen before the cost is paid (rule 601.2c before 601.2h), so
// the creature sacrificed is never in the graveyard to be targeted.
const TEXT =
  "{T}, Sacrifice a creature: Return target creature card from your graveyard to the battlefield. Activate only during your upkeep.";

export default defineCard({
  name: "Hell's Caretaker",
  manaCost: "{3}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Horror"],
  power: 1,
  toughness: 1,
  text: TEXT,
  activated: [
    {
      cost: { mana: null, tap: true, sacrifice: "creature-you-control" },
      targets: [{ kind: "card-in-graveyard", whose: "you", filter: { type: "creature" } }],
      effect: { kind: "put-onto-battlefield", target: 0 },
      resolve: null,
      condition: { kind: "all", of: [{ kind: "your-turn" }, { kind: "turn-structure", steps: ["upkeep"] }] },
      text: TEXT,
    },
  ],
});
