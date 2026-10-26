import { defineCard } from "../define.js";
import { unearth } from "../helpers.js";

const TEXT =
  "When this creature enters, it deals damage to target player equal to the number of nonbasic lands that player controls.";

export default defineCard({
  name: "Anathemancer",
  manaCost: "{1}{B}{R}",
  colors: ["B", "R"],
  types: ["creature"],
  subtypes: ["Zombie", "Wizard"],
  power: 2,
  toughness: 2,
  text: `${TEXT}\nUnearth {5}{B}{R} ({5}{B}{R}: Return this card from your graveyard to the battlefield. It gains haste. Exile it at the beginning of the next end step or if it would leave the battlefield. Unearth only as a sorcery.)`,
  activated: [unearth("{5}{B}{R}")],
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: ["player"],
      effect: {
        kind: "damage",
        target: 0,
        amount: { countOf: { type: "land", notSupertype: "basic", controlledBy: "you" }, forTarget: 0 },
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
