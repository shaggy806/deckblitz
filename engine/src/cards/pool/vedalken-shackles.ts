import { defineCard } from "../define.js";

// Fifth Dawn (5DN). EDHREC rank 11834.
//
// Rulings:
//   The creature's power and the number of Islands you control matter only when
//     the ability is activated and when it resolves (the target filter, read at
//     both). After that, only the Shackles staying tapped matters.
//   If the Shackles becomes untapped before its ability resolves, you won't gain
//     control; if it leaves the battlefield, the effect ends (`whileSourceTapped`).

const UNTAP_TEXT = "You may choose not to untap this artifact during your untap step.";
const STEAL_TEXT =
  "{2}, {T}: Gain control of target creature with power less than or equal to the number of Islands you control for as long as this artifact remains tapped.";

export default defineCard({
  name: "Vedalken Shackles",
  manaCost: "{3}",
  colors: [],
  types: ["artifact"],
  text: `${UNTAP_TEXT}\n${STEAL_TEXT}`,
  static: [{ affects: { scope: "self" }, mayChooseNotToUntap: true, text: UNTAP_TEXT }],
  activated: [
    {
      cost: { mana: "{2}", tap: true },
      targets: [
        {
          kind: "permanent",
          filter: {
            type: "creature",
            power: {
              op: "lte",
              n: { amount: { countOf: { type: "land", subtype: "Island", controlledBy: "you" } } },
            },
          },
        },
      ],
      effect: { kind: "gain-control", target: 0, untilEndOfTurn: false, whileSourceTapped: true },
      resolve: null,
      text: STEAL_TEXT,
    },
  ],
});
