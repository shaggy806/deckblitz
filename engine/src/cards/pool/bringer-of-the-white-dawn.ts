import { defineCard } from "../define.js";

// EDHREC rank 20867.

export default defineCard({
  name: "Bringer of the White Dawn",
  manaCost: "{7}{W}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Bringer"],
  power: 5,
  toughness: 5,
  keywords: ["trample"],
  text: "You may pay {W}{U}{B}{R}{G} rather than pay this spell's mana cost.\nTrample\nAt the beginning of your upkeep, you may return target artifact card from your graveyard to the battlefield.",
  alternativeCost: { mana: "{W}{U}{B}{R}{G}" },
  triggered: [
    {
      trigger: { on: "step-begins", step: "upkeep", who: "you" },
      targets: [{ kind: "card-in-graveyard", whose: "you", filter: { type: "artifact" } }],
      effect: {
        kind: "may",
        prompt: "Return target artifact card from your graveyard to the battlefield?",
        effect: { kind: "put-onto-battlefield", target: 0 },
      },
      resolve: null,
      text: "At the beginning of your upkeep, you may return target artifact card from your graveyard to the battlefield.",
    },
  ],
});
