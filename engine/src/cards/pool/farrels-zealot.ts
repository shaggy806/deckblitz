import { defineCard } from "../define.js";

// Fallen Empires (FEM). EDHREC rank 29989.
//
// Rulings:
//   In a multiplayer game, the target creature does not need to be one of the ones controlled by
//     the player you actually attacked.
//   This ability resolves during the declare blockers step. If the damage dealt this way is enough
//     to destroy an attacking or blocking creature, that other creature won't be around to deal its
//     combat damage.
//   If there are no other creatures on the battlefield, Farrel's Zealot will have to target itself.
//     Of course, you can choose not to use the ability when it resolves.
//
// "Attacks and isn't blocked" (rule 509.3g) fires as blockers are declared;
// "if you do" is the `may`'s `then`, so declining keeps its combat damage.

const TEXT =
  "Whenever this creature attacks and isn't blocked, you may have it deal 3 damage to target creature. If you do, this creature assigns no combat damage this turn.";

export default defineCard({
  name: "Farrel's Zealot",
  manaCost: "{1}{W}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Human"],
  power: 2,
  toughness: 2,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "attacks-unblocked", who: "self" },
      targets: ["creature"],
      effect: {
        kind: "may",
        prompt: "Have Farrel's Zealot deal 3 damage to the targeted creature? It then assigns no combat damage.",
        effect: { kind: "damage", amount: 3, target: 0 },
        then: { kind: "assigns-no-combat-damage", target: "source" },
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
