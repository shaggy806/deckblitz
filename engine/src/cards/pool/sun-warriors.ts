import { defineCard } from "../define.js";
import { firebending } from "../helpers.js";

// EDHREC rank 8268.
// Makes Ally → use "Ally Token".
//
// Rulings:
//   [2025-10-02] Mana from firebending abilities isn't lost until you leave combat and go to your
//     second main phase. It can be used at any time during combat, even after combat damage has
//     been dealt.
//   [2025-10-02] Any other mana you add during combat will still be lost as normal when moving
//     between steps of combat.
//   [2025-10-02] Firebending abilities aren't mana abilities. They use the stack and can be
//     responded to.
//   [2025-10-02] "Firebending N" is a keyword that represents the ability "Whenever this creature
//     attacks, add N {R}. Until end of combat, you don't lose this mana as steps end."
//   [2025-10-02] Multiple instances of firebending on the same creature trigger separately, each
//     granting you the appropriate amount of mana.

export default defineCard({
  name: "Sun Warriors",
  manaCost: "{2}{R}{W}",
  colors: ["W", "R"],
  types: ["creature"],
  subtypes: ["Human", "Warrior", "Ally"],
  power: 3,
  toughness: 5,
  text: "Firebending X, where X is the number of creatures you control. (Whenever this creature attacks, add X {R}. This mana lasts until end of combat.)\n{5}: Create a 1/1 white Ally creature token.",
  triggered: [
    // X is read as the ability resolves (it uses the stack — the rulings).
    firebending(
      { countOf: { type: "creature", controlledBy: "you" } },
      "Firebending X, where X is the number of creatures you control. (Whenever this creature attacks, add X {R}. This mana lasts until end of combat.)",
    ),
  ],
  activated: [
    {
      cost: { mana: "{5}", tap: false },
      targets: [],
      effect: { kind: "create-token", token: "Ally Token", count: 1 },
      resolve: null,
      text: "{5}: Create a 1/1 white Ally creature token.",
    },
  ],
});
