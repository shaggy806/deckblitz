import { defineCard } from "../define.js";

const CAST_TEXT = "Whenever you cast an enchantment spell, put a +1/+1 counter on this creature.";
const END_TEXT =
  "At the beginning of each end step, if an enchantment was put into your graveyard from the battlefield this turn, you may return this card from your graveyard to your hand.";

export default defineCard({
  name: "Kami of Transience",
  manaCost: "{1}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Spirit"],
  power: 2,
  toughness: 2,
  keywords: ["trample"],
  text: `Trample\n${CAST_TEXT}\n${END_TEXT}`,
  triggered: [
    {
      trigger: { on: "cast-spell", who: "you", filter: { type: "enchantment" } },
      targets: [],
      effect: { kind: "add-counter", target: "source", counter: "+1/+1", amount: 1 },
      resolve: null,
      text: CAST_TEXT,
    },
    {
      fromGraveyard: true,
      trigger: { on: "step-begins", step: "end", who: "any" },
      condition: {
        kind: "turn-history",
        what: "to-graveyard",
        who: "you",
        from: ["battlefield"],
        filter: { type: "enchantment" },
      },
      targets: [],
      effect: {
        kind: "may",
        prompt: "Return Kami of Transience from your graveyard to your hand?",
        effect: { kind: "return-to-hand", target: "source", from: "graveyard" },
      },
      resolve: null,
      text: END_TEXT,
    },
  ],
});
