import { defineCard } from "../define.js";

const RAID_TEXT =
  "Raid — When this creature enters, if you attacked this turn, exile the top two cards of your library. Choose one of them. Until the end of your next turn, you may play that card.";

export default defineCard({
  name: "Strongbox Raider",
  manaCost: "{2}{R}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Orc", "Pirate"],
  power: 5,
  toughness: 2,
  text: RAID_TEXT,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      condition: { kind: "turn-stat", stat: "attacked", who: "you", atLeast: 1 },
      targets: [],
      effect: { kind: "impulse-exile", amount: 2, duration: "your-next-turn", choose: 1 },
      resolve: null,
      text: RAID_TEXT,
    },
  ],
});
