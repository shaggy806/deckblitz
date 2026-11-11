import { defineCard } from "../define.js";

// "You may pay {2} and sacrifice a token" is one cost (`may.costSacrifice`):
// all of it or none (rule 118.3). Any token will do, not just a Food (the
// ruling), and one sacrificed for the mana can't also be the sacrifice.

const ENTER_TEXT = "When this enchantment enters, create a number of Food tokens equal to the number of opponents you have.";
const END_TEXT =
  "At the beginning of your end step, you may pay {2} and sacrifice a token. If you do, create a 4/4 green Rhino Warrior creature token.";

export default defineCard({
  name: "Killer Service",
  manaCost: "{2}{G}",
  colors: ["G"],
  types: ["enchantment"],
  text: `${ENTER_TEXT} (They're artifacts with "{2}, {T}, Sacrifice this token: You gain 3 life.")\n${END_TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: { kind: "create-token", token: "Food Token", count: { countPlayers: "each-opponent" } },
      resolve: null,
      text: ENTER_TEXT,
    },
    {
      trigger: { on: "step-begins", step: "end", who: "you" },
      targets: [],
      effect: {
        kind: "may",
        prompt: "Pay {2} and sacrifice a token?",
        cost: "{2}",
        costSacrifice: { filter: { token: true } },
        effect: { kind: "create-token", token: "Rhino Warrior Token", count: 1 },
      },
      resolve: null,
      text: END_TEXT,
    },
  ],
});
