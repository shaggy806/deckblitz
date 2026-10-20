import { defineCard } from "../define.js";

// Kaldheim (KHM). EDHREC rank 8458.
//
// One trigger per permanent targeted (its ruling): `becomes-target` fires once per object.
const TRIGGER_TEXT =
  "Whenever a permanent you control becomes the target of a spell or ability an opponent controls, you may draw a card.";

export default defineCard({
  name: "Battle Mammoth",
  manaCost: "{3}{G}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Elephant"],
  power: 6,
  toughness: 5,
  keywords: ["trample"],
  text: `Trample\n${TRIGGER_TEXT}\nForetell {2}{G}{G} (During your turn, you may pay {2} and exile this card from your hand face down. Cast it on a later turn for its foretell cost.)`,
  foretell: { cost: "{2}{G}{G}" },
  triggered: [
    {
      trigger: { on: "becomes-target", who: "you-control", byOpponentOnly: true },
      targets: [],
      effect: { kind: "may", prompt: "Draw a card?", effect: { kind: "draw", amount: 1 } },
      resolve: null,
      text: TRIGGER_TEXT,
    },
  ],
});
