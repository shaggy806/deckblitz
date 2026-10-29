import { defineCard } from "../define.js";

// EDHREC rank 11071.
// The process goes on until you decline, or can't, exile three cards from your graveyard (the
// rulings); X may be 0 for the Food ability, which then only grants menace.

const ETB_TEXT =
  "When this creature enters, create a Food token, then you may exile three cards from your graveyard. If you do, repeat this process.";
const FOOD_TEXT = "{3}{B}, Sacrifice X Foods: Creatures you control get +X/+0 and gain menace until end of turn.";

export default defineCard({
  name: "Insatiable Frugivore",
  manaCost: "{3}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Rat", "Berserker"],
  power: 2,
  toughness: 4,
  text: `${ETB_TEXT}\n${FOOD_TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: {
        kind: "repeat",
        again: { kind: "this-way", what: "exiled", atLeast: 3 },
        effect: {
          kind: "sequence",
          effects: [
            { kind: "create-token", token: "Food Token", count: 1 },
            {
              kind: "conditional",
              condition: { kind: "cards-in-graveyard", atLeast: 3 },
              then: {
                kind: "may",
                prompt: "Exile three cards from your graveyard?",
                effect: {
                  kind: "look-and-choose",
                  zone: "graveyard",
                  min: 3,
                  max: 3,
                  destination: "exile",
                  leftover: "stay",
                },
              },
            },
          ],
        },
      },
      resolve: null,
      text: ETB_TEXT,
    },
  ],
  activated: [
    {
      cost: { mana: "{3}{B}", tap: false, sacrifice: { filter: { subtype: "Food" }, count: "x" } },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          {
            kind: "modify-pt-all",
            filter: { type: "creature", controlledBy: "you" },
            power: "x",
            toughness: 0,
            duration: "end-of-turn",
          },
          {
            kind: "grant-keyword-all",
            filter: { type: "creature", controlledBy: "you" },
            keyword: "menace",
            duration: "end-of-turn",
          },
        ],
      },
      resolve: null,
      text: FOOD_TEXT,
    },
  ],
});
