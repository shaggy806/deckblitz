import { defineCard } from "../define.js";

// Legends (LEG). EDHREC rank 26392.
//
// Rulings:
//   [2009-10-01] If you don't pay {R}{R}{R} as the first ability resolves, all creatures named
//     Kobolds of Kher Keep become tapped (even the ones you don't control), as does Rohgahh. The
//     chosen opponent gains control of Rohgahh and all creatures named Kobolds of Kher Keep
//     regardless of whether you control them or whether they were tapped by the ability.
//   [2009-10-01] Rohgahh's first ability isn't targeted. You don't choose the opponent that will
//     gain control of the creatures until the ability resolves.
//
// The tap and the control change read every creature named Kobolds of Kher
// Keep, whoever controls it (the ruling); the opponent is chosen as the
// ability resolves (`choose-opponent`, not a target).

const KOBOLDS = { type: "creature", name: "Kobolds of Kher Keep" } as const;
const UPKEEP_TEXT =
  "At the beginning of your upkeep, you may pay {R}{R}{R}. If you don't, tap Rohgahh and all creatures named Kobolds of Kher Keep, then an opponent gains control of them.";
const ANTHEM_TEXT = "Creatures you control named Kobolds of Kher Keep get +2/+2.";

export default defineCard({
  name: "Rohgahh of Kher Keep",
  manaCost: "{2}{B}{B}{R}{R}",
  colors: ["B", "R"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Kobold"],
  power: 5,
  toughness: 5,
  text: `${UPKEEP_TEXT}\n${ANTHEM_TEXT}`,
  triggered: [
    {
      trigger: { on: "step-begins", step: "upkeep", who: "you" },
      targets: [],
      effect: {
        kind: "unless",
        chooser: "you",
        options: [{ pay: "{R}{R}{R}", text: "Pay {R}{R}{R}" }],
        otherwise: {
          kind: "sequence",
          effects: [
            { kind: "tap", target: "source" },
            { kind: "tap-all", filter: KOBOLDS },
            {
              kind: "choose-opponent",
              then: {
                kind: "sequence",
                effects: [
                  { kind: "gain-control", target: "source", who: "that-player", untilEndOfTurn: false },
                  { kind: "gain-control-all", filter: KOBOLDS, who: "that-player", untilEndOfTurn: false },
                ],
              },
            },
          ],
        },
      },
      resolve: null,
      text: UPKEEP_TEXT,
    },
  ],
  static: [
    {
      affects: { scope: "filter", filter: { ...KOBOLDS, controlledBy: "you" } },
      grantPt: [2, 2],
      text: ANTHEM_TEXT,
    },
  ],
});
