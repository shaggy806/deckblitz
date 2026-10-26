import { defineCard } from "../define.js";

// EDHREC rank 20064.

const TEXT =
  "Whenever this creature deals damage to an opponent, you may return target card from your graveyard to your hand.";

export default defineCard({
  name: "Charnelhoard Wurm",
  manaCost: "{4}{B}{R}{G}",
  colors: ["B", "R", "G"],
  types: ["creature"],
  subtypes: ["Wurm"],
  power: 6,
  toughness: 6,
  keywords: ["trample"],
  text: `Trample\n${TEXT}`,
  triggered: [
    {
      trigger: { on: "deals-damage", who: "self", to: "opponent" },
      targets: [{ kind: "card-in-graveyard", whose: "you" }],
      effect: {
        kind: "may",
        prompt: "Return target card from your graveyard to your hand?",
        effect: { kind: "return-to-hand", target: 0, from: "graveyard" },
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
