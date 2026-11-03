import { defineCard } from "../define.js";

// Its ruling: "any target that isn't a commander" includes any player, as well as
// any creature or planeswalker that isn't a commander. A permanent card with an
// Adventure cast as itself is no Adventure spell (the other ruling).

const TEXT =
  "Whenever you cast an Adventure or Dragon spell, Lozhan deals damage equal to that spell's mana value to any target that isn't a commander.";

export default defineCard({
  name: "Lozhan, Dragons' Legacy",
  manaCost: "{3}{U}{R}",
  colors: ["U", "R"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Dragon", "Shaman"],
  power: 4,
  toughness: 2,
  keywords: ["flying"],
  text: `Flying\n${TEXT}`,
  triggered: [
    {
      trigger: { on: "cast-spell", who: "you", filter: { anyOf: [{ subtype: "Adventure" }, { subtype: "Dragon" }] } },
      targets: [
        { kind: "permanent", filter: { typesAnyOf: ["creature", "planeswalker", "battle"], isCommander: false }, orPlayer: "any" },
      ],
      effect: { kind: "damage", amount: { manaValueOf: "trigger-object" }, target: 0 },
      resolve: null,
      text: TEXT,
    },
  ],
});
