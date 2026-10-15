import { defineCard } from "../define.js";

// EDHREC rank 21483.
// The lone attacker is any creature you control (Peggy Carter's
// `attacks-alone`), Nick Fury or another. The creature card put from the hand
// enters tapped and attacking a player or planeswalker its controller chooses
// (rule 508.4), and the `then` names it for the indestructible.

const TEXT =
  "Whenever a creature you control attacks alone, draw a card. Then you may put a creature card with mana value 3 or less from your hand onto the battlefield. It enters tapped and attacking and gains indestructible until end of turn.";

export default defineCard({
  name: "Nick Fury, Spymaster",
  manaCost: "{4}{W}",
  colors: ["W"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Spy", "Hero"],
  power: 4,
  toughness: 4,
  keywords: ["first-strike"],
  text: `First strike\n${TEXT}`,
  triggered: [
    {
      trigger: { on: "attacks-alone", who: "you-control" },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "draw", amount: 1 },
          {
            kind: "look-and-choose",
            zone: "hand",
            min: 0,
            max: 1,
            destination: "battlefield",
            enterTapped: true,
            attacking: "choose",
            leftover: "stay",
            filter: { type: "creature", manaValue: { op: "lte", n: 3 } },
            then: { kind: "grant-keyword", target: 0, keyword: "indestructible", duration: "end-of-turn" },
          },
        ],
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
