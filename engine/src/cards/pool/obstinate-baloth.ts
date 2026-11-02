import { defineCard } from "../define.js";

const ENTERS = "When this creature enters, you gain 4 life.";
const DISCARDED =
  "If a spell or ability an opponent controls causes you to discard this card, put it onto the battlefield instead of putting it into your graveyard.";

export default defineCard({
  name: "Obstinate Baloth",
  manaCost: "{2}{G}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Beast"],
  power: 4,
  toughness: 4,
  text: `${ENTERS}\n${DISCARDED}`,
  discardedByOpponentEnters: {},
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: { kind: "gain-life", amount: 4 },
      resolve: null,
      text: ENTERS,
    },
  ],
});
