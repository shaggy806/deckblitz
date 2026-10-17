import { defineCard } from "../define.js";

// EDHREC rank 24955.
//
// Spit Flame's shape: a trigger that works only from the graveyard
// (`fromGraveyard`), whose "you may pay {2}. If you do" is a `may` with a cost.

const RETURN_TEXT =
  "Whenever an enchantment you control enters, you may pay {2}. If you do, return this card from your graveyard to your hand.";

export default defineCard({
  name: "Redtooth Vanguard",
  manaCost: "{1}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Elf", "Warrior"],
  power: 3,
  toughness: 1,
  keywords: ["trample"],
  text: `Trample\n${RETURN_TEXT}`,
  triggered: [
    {
      fromGraveyard: true,
      trigger: { on: "enters-battlefield", who: "you-control", filter: { type: "enchantment" } },
      targets: [],
      effect: {
        kind: "may",
        prompt: "Pay {2} to return Redtooth Vanguard to your hand?",
        cost: "{2}",
        effect: { kind: "return-to-hand", target: "source", from: "graveyard" },
      },
      resolve: null,
      text: RETURN_TEXT,
    },
  ],
});
