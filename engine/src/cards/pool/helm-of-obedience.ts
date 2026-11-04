import { defineCard } from "../define.js";

const HELM =
  "{X}, {T}: Target opponent mills a card, then repeats this process until a creature card or X cards have been put into their graveyard this way, whichever comes first. If one or more creature cards were put into that graveyard this way, sacrifice this artifact and put one of them onto the battlefield under your control. X can't be 0.";

const CREATURE_THIS_WAY = { kind: "this-way", what: "put-into-graveyard", filter: { type: "creature" } } as const;

// Rest in Peace: nothing reaches the graveyard, so the mills go on until the
// library has run out (a pass that mills nothing ends it). Legends (LEG).
// EDHREC rank 12665.
export default defineCard({
  name: "Helm of Obedience",
  manaCost: "{4}",
  colors: [],
  types: ["artifact"],
  text: HELM,
  activated: [
    {
      cost: { mana: "{X}", tap: true },
      minX: 1,
      targets: ["opponent"],
      effect: {
        kind: "sequence",
        effects: [
          {
            kind: "repeat",
            effect: { kind: "mill", target: 0, amount: 1 },
            again: {
              kind: "all",
              of: [
                { kind: "this-way", what: "milled" },
                {
                  kind: "not",
                  of: {
                    kind: "any",
                    of: [
                      { ...CREATURE_THIS_WAY, acrossPasses: true },
                      { kind: "this-way", what: "put-into-graveyard", atLeast: "x", acrossPasses: true },
                    ],
                  },
                },
              ],
            },
          },
          {
            kind: "conditional",
            condition: CREATURE_THIS_WAY,
            then: {
              kind: "sequence",
              effects: [
                { kind: "sacrifice-source" },
                {
                  kind: "look-and-choose",
                  zone: "graveyard",
                  from: { target: 0 },
                  min: 1,
                  max: 1,
                  filter: { thisWay: "put-into-graveyard", type: "creature" },
                  destination: "battlefield",
                  leftover: "stay",
                },
              ],
            },
          },
        ],
      },
      resolve: null,
      text: HELM,
    },
  ],
});
