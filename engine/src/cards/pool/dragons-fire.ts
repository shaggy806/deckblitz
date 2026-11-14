import { defineCard } from "../define.js";

// EDHREC rank 7217.
//
// "Reveal a Dragon card from your hand or choose a Dragon you control" is
// behold a Dragon (rule 701.4a), an optional additional cost: the kicked
// cast, offered only with a Dragon to behold. The damage is then the power of
// what was beheld (`{ paid: "beheld" }`): a chosen Dragon's as the spell
// resolves, or as it last existed on the battlefield if it has left (the
// ruling); a revealed card's as it was in the hand.

export default defineCard({
  name: "Dragon's Fire",
  manaCost: "{1}{R}",
  colors: ["R"],
  types: ["instant"],
  text: "As an additional cost to cast this spell, you may reveal a Dragon card from your hand or choose a Dragon you control.\nDragon's Fire deals 3 damage to target creature or planeswalker. If you revealed a Dragon card or chose a Dragon as you cast this spell, Dragon's Fire deals damage equal to the power of that card or creature instead.",
  kicker: {
    cost: "",
    keyword: "behold",
    behold: { filter: { subtype: "Dragon" }, text: "a Dragon" },
    effect: { kind: "damage", amount: { powerOf: { paid: "beheld" } }, target: 0 },
  },
  targets: [{ kind: "permanent", whose: "any", filter: { typesAnyOf: ["creature", "planeswalker"] } }],
  effect: { kind: "damage", amount: 3, target: 0 },
});
