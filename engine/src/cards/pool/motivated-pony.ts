import { defineCard } from "../define.js";

// EDHREC rank 7816.
//
// Rulings:
//   [2024-11-08] If an effect refers to a Food, it means any Food artifact, not just a Food
//     artifact token.
//
// "Attacking creatures" and "those creatures" are the same creatures, read
// once each as the trigger resolves (nothing can change between the two
// reads). The Food check is the turn's history of permanents that entered
// under your control (Thoughtweft Charge's `turn-history`), one that has
// since left counted as it last existed.

const TEXT =
  "Whenever this creature attacks, attacking creatures get +1/+1 until end of turn. If a Food entered the battlefield under your control this turn, untap those creatures and they get an additional +2/+2 until end of turn.";

export default defineCard({
  name: "Motivated Pony",
  manaCost: "{4}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Horse"],
  power: 3,
  toughness: 3,
  keywords: ["trample", "haste"],
  text: `Trample, haste\n${TEXT}`,
  triggered: [
    {
      trigger: { on: "attacks", who: "self" },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          {
            kind: "modify-pt-all",
            filter: { type: "creature", attacking: true },
            power: 1,
            toughness: 1,
            duration: "end-of-turn",
          },
          {
            kind: "conditional",
            condition: { kind: "turn-history", what: "entered", filter: { type: "artifact", subtype: "Food" } },
            then: {
              kind: "sequence",
              effects: [
                { kind: "untap-all", filter: { type: "creature", attacking: true } },
                {
                  kind: "modify-pt-all",
                  filter: { type: "creature", attacking: true },
                  power: 2,
                  toughness: 2,
                  duration: "end-of-turn",
                },
              ],
            },
          },
        ],
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
