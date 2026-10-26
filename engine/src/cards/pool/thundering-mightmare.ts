import { defineCard } from "../define.js";
import { soulbond } from "../helpers.js";

export default defineCard({
  name: "Thundering Mightmare",
  manaCost: "{4}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Horse", "Spirit"],
  power: 3,
  toughness: 3,
  text: "Soulbond (You may pair this creature with another unpaired creature when either enters. They remain paired for as long as you control both of them.)\nAs long as Thundering Mightmare is paired with another creature, each of those creatures has \"Whenever an opponent casts a spell, put a +1/+1 counter on this creature.\"",
  triggered: soulbond(),
  static: [
    {
      affects: { scope: "paired" },
      grantsTriggered: [
        {
          trigger: { on: "cast-spell", who: "opponent" },
          targets: [],
          effect: { kind: "add-counter", target: "source", counter: "+1/+1", amount: 1 },
          resolve: null,
          text: "Whenever an opponent casts a spell, put a +1/+1 counter on this creature.",
        },
      ],
      text: "As long as Thundering Mightmare is paired with another creature, each of those creatures has \"Whenever an opponent casts a spell, put a +1/+1 counter on this creature.\"",
    },
  ],
});
