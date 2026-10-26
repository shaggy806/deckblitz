import { defineCard } from "../define.js";

const RETURN_TEXT =
  "Whenever you cast a creature spell, you may pay {G}{G}. If you do, return this card from your graveyard to your hand.";

export default defineCard({
  name: "Masked Admirers",
  manaCost: "{2}{G}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Elf", "Shaman"],
  power: 3,
  toughness: 2,
  text: `When this creature enters, draw a card.\n${RETURN_TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: { kind: "draw", amount: 1 },
      resolve: null,
      text: "When this creature enters, draw a card.",
    },
    {
      fromGraveyard: true,
      trigger: { on: "cast-spell", who: "you", filter: { type: "creature" } },
      targets: [],
      effect: {
        kind: "may",
        prompt: "Pay {G}{G} to return Masked Admirers to your hand?",
        cost: "{G}{G}",
        effect: { kind: "return-to-hand", target: "source", from: "graveyard" },
      },
      resolve: null,
      text: RETURN_TEXT,
    },
  ],
});
