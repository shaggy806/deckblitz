import { defineCard } from "../define.js";

// EDHREC rank 6043.
//
// "Attacked this turn by an Assassin you controlled" is the journal's attack
// entries at that player (not a planeswalker of theirs), each attacker matched
// as it was declared and its controller then (the rulings: one put onto the
// battlefield attacking never attacked, and one that became an Assassin after
// the declaration doesn't count). Asked as the trigger triggers and as it
// resolves (rule 603.4).

const LORD = "Other Assassins you control get +1/+1.";
const WIN = "Whenever a player loses the game, if they were attacked this turn by an Assassin you controlled, you win the game.";

export default defineCard({
  name: "Ramses, Assassin Lord",
  manaCost: "{2}{U}{B}",
  colors: ["U", "B"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Assassin"],
  power: 4,
  toughness: 4,
  keywords: ["deathtouch"],
  text: `Deathtouch\n${LORD}\n${WIN}`,
  static: [
    {
      affects: { scope: "filter", filter: { type: "creature", subtype: "Assassin", controlledBy: "you" }, excludeSelf: true },
      grantPt: [1, 1],
      text: LORD,
    },
  ],
  triggered: [
    {
      trigger: { on: "event", event: "loses-game", who: "any" },
      condition: {
        kind: "turn-history",
        what: "attackers",
        who: "you",
        filter: { subtype: "Assassin" },
        against: "that-player",
      },
      targets: [],
      effect: { kind: "win-game" },
      resolve: null,
      text: WIN,
    },
  ],
});
