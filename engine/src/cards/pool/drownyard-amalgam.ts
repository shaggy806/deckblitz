import { defineCard } from "../define.js";

export default defineCard({
  name: "Drownyard Amalgam",
  manaCost: "{4}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Zombie", "Horror"],
  power: 3,
  toughness: 6,
  text: "When this creature enters, target player mills three cards. (They put the top three cards of their library into their graveyard.)\n{2}{U}: This creature can't be blocked this turn.",
  activated: [
    {
      cost: { mana: "{2}{U}", tap: false },
      targets: [],
      effect: {
        kind: "grant-keyword",
        target: "source",
        keyword: "unblockable",
        duration: "end-of-turn",
      },
      resolve: null,
      text: "{2}{U}: This creature can't be blocked this turn.",
    },
  ],
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: ["player"],
      effect: { kind: "mill", target: 0, amount: 3 },
      resolve: null,
      text: "When this creature enters, target player mills three cards.",
    },
  ],
});
