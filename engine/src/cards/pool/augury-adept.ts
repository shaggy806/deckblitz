import { defineCard } from "../define.js";

const TEXT =
  "Whenever this creature deals combat damage to a player, reveal the top card of your library and put that card into your hand. You gain life equal to its mana value.";

export default defineCard({
  name: "Augury Adept",
  manaCost: "{1}{W/U}{W/U}",
  colors: ["W", "U"],
  types: ["creature"],
  subtypes: ["Kithkin", "Wizard"],
  power: 2,
  toughness: 2,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "deals-combat-damage-to-player", who: "self" },
      targets: [],
      effect: {
        kind: "look-and-choose",
        zone: "library",
        count: 1,
        min: 1,
        max: 1,
        destination: "hand",
        leftover: "stay",
        reveal: true,
        then: { kind: "gain-life", amount: { manaValueOf: 0 } },
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
