import { defineCard } from "../define.js";

const PLUS = "+1: Untap target Mountain. It becomes a 4/4 red Elemental creature until end of turn. It's still a land.";
const MANA = "−2: Add {R} for each Mountain you control.";
const EMBLEM = "Mountains you control have \"{T}: This land deals 1 damage to any target.\"";
const ULT = `−5: You get an emblem with "${EMBLEM.replace(/"/g, "'")}"`;

export default defineCard({
  name: "Koth of the Hammer",
  manaCost: "{2}{R}{R}",
  colors: ["R"],
  supertypes: ["legendary"],
  types: ["planeswalker"],
  subtypes: ["Koth"],
  loyalty: 3,
  text: `${PLUS}\n${MANA}\n${ULT}`,
  activated: [
    {
      loyaltyCost: 1,
      cost: { mana: null, tap: false },
      targets: [{ kind: "permanent", filter: { subtype: "Mountain" } }],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "untap", target: 0 },
          {
            kind: "animate",
            target: 0,
            power: 4,
            toughness: 4,
            addTypes: ["creature"],
            addSubtypes: ["Elemental"],
            setColors: ["R"],
            duration: "end-of-turn",
          },
        ],
      },
      resolve: null,
      text: PLUS,
    },
    {
      loyaltyCost: -2,
      cost: { mana: null, tap: false },
      targets: [],
      effect: { kind: "add-mana", mana: "R", amount: { countOf: { subtype: "Mountain", controlledBy: "you" } } },
      resolve: null,
      text: MANA,
    },
    {
      loyaltyCost: -5,
      cost: { mana: null, tap: false },
      targets: [],
      effect: {
        kind: "create-emblem",
        text: EMBLEM,
        static: {
          affects: { scope: "filter", filter: { subtype: "Mountain", controlledBy: "you" } },
          grantsActivated: [
            {
              cost: { mana: null, tap: true },
              targets: ["any-target"],
              effect: { kind: "damage", amount: 1, target: 0 },
              resolve: null,
              text: "{T}: This land deals 1 damage to any target.",
            },
          ],
          text: EMBLEM,
        },
      },
      resolve: null,
      text: ULT,
    },
  ],
});
