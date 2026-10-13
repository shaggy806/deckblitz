import { defineCard } from "../define.js";

// EDHREC rank 7018.
//
// Rulings:
//   [2020-08-07] If Sharuum the Hegemon is put into your graveyard as a state-based action
//     immediately after Sharuum the Hegemon enters the battlefield (most likely due to the "legend
//     rule") it can be the artifact card targeted by its own ability.

const ENTERS = "When Sharuum enters, you may return target artifact card from your graveyard to the battlefield.";

export default defineCard({
  name: "Sharuum the Hegemon",
  manaCost: "{3}{W}{U}{B}",
  colors: ["W", "U", "B"],
  supertypes: ["legendary"],
  types: ["artifact", "creature"],
  subtypes: ["Sphinx"],
  power: 5,
  toughness: 5,
  keywords: ["flying"],
  text: `Flying\n${ENTERS}`,
  // The target is chosen as the trigger goes on the stack, after the legend
  // rule has put a second Sharuum into the graveyard — so it can be that one
  // (the ruling).
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [{ kind: "card-in-graveyard", whose: "you", filter: { type: "artifact" } }],
      effect: {
        kind: "may",
        prompt: "Return target artifact card from your graveyard to the battlefield?",
        effect: { kind: "put-onto-battlefield", target: 0 },
      },
      resolve: null,
      text: ENTERS,
    },
  ],
});
