import { defineCard } from "../define.js";

// EDHREC rank 11391.
// Makes Spirit → use "Spirit Token (White-Black)".
//
// "If it was a creature card" reads the exiled card's printed
// characteristics (Deluge of the Dead's shape).
const EXILE_TEXT =
  "{2}{W}{B}: Exile target card from an opponent's graveyard. If it was a creature card, you create a 1/1 white and black Spirit creature token with flying.";

export default defineCard({
  name: "Ethereal Absolution",
  manaCost: "{4}{W}{B}",
  colors: ["W", "B"],
  types: ["enchantment"],
  text: `Creatures you control get +1/+1.\nCreatures your opponents control get -1/-1.\n${EXILE_TEXT}`,
  static: [
    {
      affects: { scope: "creatures-you-control" },
      grantPt: [1, 1],
      text: "Creatures you control get +1/+1.",
    },
    {
      affects: { scope: "filter", filter: { type: "creature", controlledBy: "opponent" } },
      grantPt: [-1, -1],
      text: "Creatures your opponents control get -1/-1.",
    },
  ],
  activated: [
    {
      cost: { mana: "{2}{W}{B}", tap: false },
      targets: [{ kind: "card-in-graveyard", whose: "opponent" }],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "exile", target: 0 },
          {
            kind: "conditional",
            condition: { kind: "target", index: 0, filter: { type: "creature" } },
            then: { kind: "create-token", token: "Spirit Token (White-Black)", count: 1 },
          },
        ],
      },
      resolve: null,
      text: EXILE_TEXT,
    },
  ],
});
