import { defineCard } from "../define.js";

// EDHREC rank 7247.

export default defineCard({
  name: "Nightkin Ambusher",
  manaCost: "{2}{U}{B}",
  colors: ["U", "B"],
  types: ["creature"],
  subtypes: ["Mutant", "Warrior"],
  power: 4,
  toughness: 4,
  text: "Ward {2} (Whenever this creature becomes the target of a spell or ability an opponent controls, counter it unless that player pays {2}.)\nWhen this creature enters, target player gets four rad counters.\nThis creature can't be blocked as long as defending player has a rad counter.",
  triggered: [
    {
      trigger: { on: "becomes-target", who: "self", byOpponentOnly: true },
      targets: [],
      effect: { kind: "ward", cost: { mana: "{2}" } },
      resolve: null,
      text: "Ward {2}",
    },
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: ["player"],
      effect: { kind: "add-player-counters", counter: "rad", amount: 4, target: 0 },
      resolve: null,
      text: "When this creature enters, target player gets four rad counters.",
    },
  ],
  static: [
    {
      affects: { scope: "self" },
      grantKeywords: ["unblockable"],
      text: "This creature can't be blocked as long as defending player has a rad counter.",
      condition: {
        kind: "of-player",
        player: "defending-player",
        condition: { kind: "player-counters", counter: "rad", who: "you", atLeast: 1 },
      },
    },
  ],
});
