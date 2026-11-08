import { defineCard } from "../define.js";

// "Tetzin or another double-faced artifact you control": Tetzin is one, so
// one filter covers both.

const ENTER_TEXT =
  "Whenever Tetzin or another double-faced artifact you control enters, mill three cards. You may put an artifact card from among them into your hand.";

export default defineCard({
  name: "Tetzin, Gnome Champion",
  manaCost: "{U}{R}{W}",
  colors: ["W", "U", "R"],
  supertypes: ["legendary"],
  types: ["artifact", "creature"],
  subtypes: ["Gnome"],
  power: 2,
  toughness: 2,
  text: `${ENTER_TEXT}\nCraft with six artifacts {4} ({4}, Exile this artifact, Exile the six from among other permanents you control and/or cards from your graveyard: Return this card transformed under its owner's control. Craft only as a sorcery.)`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "you-control", filter: { type: "artifact", doubleFaced: true } },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "mill", target: "you", amount: 3 },
          {
            kind: "look-and-choose",
            zone: "graveyard",
            min: 0,
            max: 1,
            destination: "hand",
            leftover: "stay",
            filter: { thisWay: "milled", type: "artifact" },
          },
        ],
      },
      resolve: null,
      text: ENTER_TEXT,
    },
  ],
  activated: [
    {
      cost: {
        mana: "{4}",
        tap: false,
        
        craft: { count: 6, filter: { type: "artifact" }, text: "six artifacts" },
        do: { kind: "exile", target: "source" },
      },
      sorcerySpeed: true,
      targets: [],
      effect: { kind: "craft-return" },
      resolve: null,
      text: "Craft with six artifacts {4}",
    },
  ],
  faces: ["Tetzin, Gnome Champion", "The Golden-Gear Colossus"],
  transform: true,
});
