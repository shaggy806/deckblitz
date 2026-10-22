import { defineCard } from "../define.js";

// Amonkhet. EDHREC rank 28978.
//
// Rulings:
//   The enters ability affects only creatures you control at the time it
//   resolves.
//   The Trial is returned to its owner's hand only if it's on the battlefield
//   as the ability resolves.

const ETB = "When this enchantment enters, creatures you control get +2/+1 and gain vigilance until end of turn.";
const CARTOUCHE = "When a Cartouche you control enters, return this enchantment to its owner's hand.";

export default defineCard({
  name: "Trial of Solidarity",
  manaCost: "{2}{W}",
  colors: ["W"],
  types: ["enchantment"],
  text: `${ETB}\n${CARTOUCHE}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          {
            kind: "modify-pt-all",
            filter: { type: "creature", controlledBy: "you" },
            power: 2,
            toughness: 1,
            duration: "end-of-turn",
          },
          {
            kind: "grant-keyword-all",
            filter: { type: "creature", controlledBy: "you" },
            keyword: "vigilance",
            duration: "end-of-turn",
          },
        ],
      },
      resolve: null,
      text: ETB,
    },
    {
      trigger: { on: "enters-battlefield", who: "you-control", filter: { subtype: "Cartouche" } },
      targets: [],
      effect: { kind: "return-to-hand", target: "source" },
      resolve: null,
      text: CARTOUCHE,
    },
  ],
});
