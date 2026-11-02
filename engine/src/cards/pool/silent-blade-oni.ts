import { defineCard } from "../define.js";
import { ninjutsu, ninjutsuText } from "../helpers.js";

const TEXT =
  "Whenever this creature deals combat damage to a player, look at that player's hand. You may cast a spell from among those cards without paying its mana cost.";

export default defineCard({
  name: "Silent-Blade Oni",
  manaCost: "{3}{U}{U}{B}{B}",
  colors: ["U", "B"],
  types: ["creature"],
  subtypes: ["Demon", "Ninja"],
  power: 6,
  toughness: 5,
  text: `${ninjutsuText("{4}{U}{B}")}\n${TEXT}`,
  activated: [ninjutsu("{4}{U}{B}")],
  triggered: [
    {
      trigger: { on: "deals-combat-damage-to-player", who: "self" },
      resolve: null,
      text: TEXT,
      targets: [],
      effect: { kind: "cast-now", from: { handOf: "trigger-player", look: true }, free: true },
    },
  ],
});
