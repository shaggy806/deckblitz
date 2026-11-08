import { defineCard } from "../define.js";

// EDHREC rank 19858.
//
// Rulings:
//   [2013-04-15] A mana ability is an ability that (1) isn't a loyalty ability, (2) doesn't
//     target, and (3) could add mana when it resolves.
//   [2016-06-08] Activated abilities contain a colon. They're generally written "[Cost]:
//     [Effect]." Some keywords are activated abilities and will have colons in their reminder
//     text.

export default defineCard({
  name: "Tsabo's Web",
  manaCost: "{2}",
  colors: [],
  types: ["artifact"],
  text: "When this artifact enters, draw a card.\nEach land with an activated ability that isn't a mana ability doesn't untap during its controller's untap step.",
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: { kind: "draw", amount: 1 },
      resolve: null,
      text: "When this artifact enters, draw a card.",
    },
  ],
  static: [
    {
      affects: { scope: "filter", filter: { type: "land", hasActivatedAbility: { mana: false } } },
      restrictions: ["doesnt-untap"],
      text: "Each land with an activated ability that isn't a mana ability doesn't untap during its controller's untap step.",
    },
  ],
});
