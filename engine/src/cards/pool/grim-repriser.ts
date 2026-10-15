import { defineCard } from "../define.js";

// Reality Fracture (FRA). EDHREC rank 30697.
//
// The return is Bloodsoaked Champion's graveyard ability (the card stays in
// the graveyard while it's on the stack) with Mirko's finality counter,
// gated on any one opponent's `noncombat-damage-taken` this turn.
const PROWESS_TEXT = "Prowess (Whenever you cast a noncreature spell, this creature gets +1/+1 until end of turn.)";
const RETURN_TEXT =
  "{B}{R}: Return this card from your graveyard to the battlefield with a finality counter on it. Activate only if an opponent has been dealt noncombat damage this turn. (If a creature with a finality counter on it would die, exile it instead.)";

export default defineCard({
  name: "Grim Repriser",
  manaCost: "{B}{R}",
  colors: ["B", "R"],
  types: ["creature"],
  subtypes: ["Zombie", "Bard"],
  power: 2,
  toughness: 2,
  text: `${PROWESS_TEXT}\n${RETURN_TEXT}`,
  activated: [
    {
      cost: { mana: "{B}{R}", tap: false },
      zone: "graveyard",
      staysInZone: true,
      condition: { kind: "turn-stat", stat: "noncombat-damage-taken", who: "opponent", atLeast: 1 },
      targets: [],
      effect: { kind: "put-onto-battlefield", target: "source", withCounters: { kind: "finality", amount: 1 } },
      resolve: null,
      text: RETURN_TEXT,
    },
  ],
  triggered: [
    {
      trigger: { on: "cast-spell", who: "you", noncreatureOnly: true },
      targets: [],
      effect: { kind: "modify-pt", target: "source", power: 1, toughness: 1, duration: "end-of-turn" },
      resolve: null,
      text: PROWESS_TEXT,
    },
  ],
});
