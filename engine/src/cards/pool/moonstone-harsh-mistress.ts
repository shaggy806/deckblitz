import { defineCard } from "../define.js";

const TEXT =
  "Whenever you discard a card, you may exile that card from your graveyard. If you do, until the end of your next turn, you may play that card.";

export default defineCard({
  name: "Moonstone, Harsh Mistress",
  manaCost: "{3}{B}",
  colors: ["B"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Doctor", "Villain"],
  power: 2,
  toughness: 4,
  keywords: ["flying"],
  text: `Flying\n${TEXT}`,
  triggered: [
    {
      trigger: { on: "discards", who: "you", perCard: true },
      targets: [],
      effect: {
        kind: "may",
        prompt: "Exile that card, and you may play it until the end of your next turn?",
        effect: { kind: "exile", target: "trigger-object", mayPlay: { duration: "until-end-of-your-next-turn", play: true } },
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
