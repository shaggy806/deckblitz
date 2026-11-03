import { defineCard } from "../define.js";
import { squadTrigger } from "../helpers.js";

// Rulings:
//   You may pay the squad cost any number of times. You will create a token that is a copy of that
//     permanent for each time you paid the squad cost. If you paid the squad cost multiple times, the
//     tokens will all enter the battlefield simultaneously.
//   If the spell resolves but the creature with squad leaves the battlefield before its squad ability
//     resolves, you'll still create the token copies.
//   Once you announce that you're casting Ruthless Radrat, no player may take actions until you're
//     done casting it. Notably, opponents can't try to remove cards from your graveyard to stop you
//     from paying Ruthless Radrat's squad cost.

export default defineCard({
  name: "Ruthless Radrat",
  manaCost: "{1}{B}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Rat", "Mutant"],
  power: 2,
  toughness: 2,
  keywords: ["menace"],
  kicker: {
    cost: "",
    multi: true,
    keyword: "squad",
    also: { text: "Exile four cards from your graveyard", exileFromGraveyard: { count: 4 } },
  },
  text: "Squad—Exile four cards from your graveyard. (As an additional cost to cast this spell, you may pay its squad cost any number of times. When this creature enters, create that many tokens that are copies of it.)\nMenace (This creature can't be blocked except by two or more creatures.)",
  triggered: [squadTrigger()],
});
