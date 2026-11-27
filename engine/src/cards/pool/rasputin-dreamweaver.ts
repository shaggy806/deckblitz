import { defineCard } from "../define.js";

// EDHREC rank 22403.
//
// Rulings:
//   The fourth ability has an "intervening 'if' clause," so it won't trigger
//     at all unless Rasputin Dreamweaver started the turn untapped.
//   If a permanent with eight or more dream counters on it becomes a copy of
//     Rasputin Dreamweaver (or just gains its last ability), all dream
//     counters except seven are removed from it as a state-based action.
//   If a number of dream counters would be put on Rasputin Dreamweaver for
//     any reason that would bring the total number of dream counters on it to
//     eight or more, the total number of dream counters on it is brought to
//     seven instead.
//
// "Started the turn untapped": on the battlefield untapped as the turn began,
// before its untap step (`startedTurnUntapped`, read off the journal's turn
// record). The cap is `counterCap` (rules 122.4, 704.5r).

const ENTER = "Rasputin enters with seven dream counters on it.";
const MANA = "Remove a dream counter from Rasputin: Add {C}.";
const PREVENT = "Remove a dream counter from Rasputin: Prevent the next 1 damage that would be dealt to Rasputin this turn.";
const UPKEEP = "At the beginning of your upkeep, if Rasputin started the turn untapped, put a dream counter on it.";
const CAP = "Rasputin can't have more than seven dream counters on it.";

export default defineCard({
  name: "Rasputin Dreamweaver",
  manaCost: "{4}{W}{U}",
  colors: ["W", "U"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Wizard"],
  power: 4,
  toughness: 1,
  text: `${ENTER}\n${MANA}\n${PREVENT}\n${UPKEEP}\n${CAP}`,
  static: [
    {
      affects: { scope: "self" },
      replacement: { event: "enters-battlefield", counters: { kind: "dream", amount: 7 } },
      text: ENTER,
    },
    {
      affects: { scope: "self" },
      counterCap: { kind: "dream", max: 7 },
      text: CAP,
    },
  ],
  activated: [
    {
      cost: { mana: null, tap: false, removeCounter: { kind: "dream", count: 1 } },
      targets: [],
      effect: { kind: "add-mana", mana: "C", amount: 1 },
      resolve: null,
      text: MANA,
    },
    {
      cost: { mana: null, tap: false, removeCounter: { kind: "dream", count: 1 } },
      targets: [],
      effect: { kind: "prevent-damage", target: "source", amount: 1 },
      resolve: null,
      text: PREVENT,
    },
  ],
  triggered: [
    {
      trigger: { on: "step-begins", step: "upkeep", who: "you" },
      condition: { kind: "source", filter: { startedTurnUntapped: true } },
      targets: [],
      effect: { kind: "add-counter", target: "source", counter: "dream", amount: 1 },
      resolve: null,
      text: UPKEEP,
    },
  ],
});
