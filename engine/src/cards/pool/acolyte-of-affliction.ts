import { defineCard } from "../define.js";

// Not targeted: the card may be one just milled (the ruling). A permanent
// card is any card that isn't an instant or sorcery (Spring-Leaf Avenger's
// filter).
const ENTER_TEXT =
  "When this creature enters, mill two cards, then you may return a permanent card from your graveyard to your hand.";

export default defineCard({
  name: "Acolyte of Affliction",
  manaCost: "{2}{B}{G}",
  colors: ["B", "G"],
  types: ["creature"],
  subtypes: ["Human", "Cleric"],
  power: 2,
  toughness: 3,
  text: ENTER_TEXT,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "mill", target: "you", amount: 2 },
          {
            kind: "look-and-choose",
            zone: "graveyard",
            min: 0,
            max: 1,
            destination: "hand",
            leftover: "stay",
            filter: { notTypes: ["instant", "sorcery"] },
          },
        ],
      },
      resolve: null,
      text: ENTER_TEXT,
    },
  ],
});
