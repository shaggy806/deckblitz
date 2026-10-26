import { defineCard } from "../define.js";

// EDHREC rank 19034.
//
// Rulings:
//   [2011-01-22] In most cases, attacking creatures will already be tapped. They still won't untap
//     during their controller's next untap step.
//   [2011-01-22] Clinging Mists doesn't track the controller of the attacking creatures. If one of
//     them changes controller before its previous controller's next untap step, it won't untap
//     during its new controller's next untap step.
// `tap-all`'s `doesntUntapNext` marks each creature for whoever controls it at
// its next untap step, which is the second ruling.
export default defineCard({
  name: "Clinging Mists",
  manaCost: "{2}{G}",
  colors: ["G"],
  types: ["instant"],
  text: "Prevent all combat damage that would be dealt this turn.\nFateful hour — If you have 5 or less life, tap all attacking creatures. Those creatures don't untap during their controller's next untap step.",
  targets: [],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "prevent-all-combat-damage" },
      {
        kind: "conditional",
        condition: { kind: "life-total", who: "you", atMost: 5 },
        then: { kind: "tap-all", filter: { type: "creature", attacking: true }, doesntUntapNext: true },
      },
    ],
  },
});
