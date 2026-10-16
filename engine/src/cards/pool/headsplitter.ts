import { defineCard } from "../define.js";
import { equip } from "../helpers.js";

// EDHREC rank 17164. HYDRA Disintegrator's shape.
//
// Rulings:
//   [2024-07-05] The Assassin token that you create enters the battlefield as a 1/1 creature. Any
//     abilities that trigger when a creature with a certain power enters the battlefield will see
//     the token enter as a 1/1 creature. Static abilities that affect the Assassin's power and
//     toughness may change this.
//   [2024-07-05] No player may take any actions between the time you create the Assassin token and
//     the time Headsplitter becomes attached to it.
//   [2024-07-05] If the triggered ability causes two Assassins to be created (due to an effect such
//     as that of Doubling Season), Headsplitter becomes attached to one of them.

const ENTERS =
  "When this Equipment enters, create a 1/1 black Assassin creature token with menace, then attach this Equipment to it.";

export default defineCard({
  name: "Headsplitter",
  manaCost: "{1}{R}",
  colors: ["R"],
  types: ["artifact"],
  subtypes: ["Equipment"],
  text: `${ENTERS}\nEquipped creature gets +1/+0.\nEquip {2} ({2}: Attach to target creature you control. Equip only as a sorcery.)`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "create-token", token: "Assassin Token (Aya of Alexandria)", count: 1 },
          { kind: "attach", target: "created", attachment: "source" },
        ],
      },
      resolve: null,
      text: ENTERS,
    },
  ],
  static: [{ affects: { scope: "attached" }, grantPt: [1, 0], text: "Equipped creature gets +1/+0." }],
  activated: [equip("{2}")],
});
