import { defineCard } from "../define.js";

// EDHREC rank 20980.
//
// Rulings:
//   [2024-07-05] The set of creatures that gain deathtouch is determined as Hemlock Vial’s last
//     ability resolves. Creatures you control that become equipped later in the turn won’t gain
//     deathtouch, even if the Equipment that becomes attached to them has deathtouch.
//
// - `grant-keyword-all` fixes its matches as it resolves (rule 611.2c), which
//   is the ruling. "You control" covers both halves.

const ENTERS = "When this artifact enters, you draw a card and you lose 1 life.";
const ABILITY =
  "{B}, {T}, Sacrifice this artifact: Each equipped creature and Equipment you control gains deathtouch until end of turn.";

export default defineCard({
  name: "Hemlock Vial",
  manaCost: "{1}{B}",
  colors: ["B"],
  types: ["artifact"],
  text: `${ENTERS}\n${ABILITY}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "draw", amount: 1 },
          { kind: "lose-life", amount: 1 },
        ],
      },
      resolve: null,
      text: ENTERS,
    },
  ],
  activated: [
    {
      cost: { mana: "{B}", tap: true, sacrifice: "self" },
      targets: [],
      effect: {
        kind: "grant-keyword-all",
        filter: { controlledBy: "you", anyOf: [{ type: "creature", equipped: true }, { subtype: "Equipment" }] },
        keyword: "deathtouch",
        duration: "end-of-turn",
      },
      resolve: null,
      text: ABILITY,
    },
  ],
});
