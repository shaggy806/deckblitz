import { defineCard } from "../define.js";

// Rulings:
//   [2021-11-19] Activating Wedding Invitation's last ability targeting a creature that has
//     already been blocked won't cause that creature to become unblocked.

const ETB_TEXT = "When this artifact enters, draw a card.";
const SAC_TEXT =
  "{T}, Sacrifice this artifact: Target creature can't be blocked this turn. If it's a Vampire, it also gains lifelink until end of turn.";

export default defineCard({
  name: "Wedding Invitation",
  manaCost: "{2}",
  colors: [],
  types: ["artifact"],
  text: `${ETB_TEXT}\n${SAC_TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: { kind: "draw", amount: 1 },
      resolve: null,
      text: ETB_TEXT,
    },
  ],
  activated: [
    {
      cost: { mana: null, tap: true, sacrifice: "self" },
      targets: ["creature"],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "grant-keyword", target: 0, keyword: "unblockable", duration: "end-of-turn" },
          {
            kind: "conditional",
            condition: { kind: "target", index: 0, filter: { subtype: "Vampire" } },
            then: { kind: "grant-keyword", target: 0, keyword: "lifelink", duration: "end-of-turn" },
          },
        ],
      },
      resolve: null,
      text: SAC_TEXT,
    },
  ],
});
