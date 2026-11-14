import { defineCard } from "../define.js";

// EDHREC rank 10250.
//
// Both targets are chosen as it's activated, the activator's first (the
// ruling, rules 602.2b, 601.2c): the opponent who chooses the second is the
// controller of the first (`otherChooserControls`), and may choose any
// creature, the same one included (rule 115.3). Then the coin decides which
// target is destroyed.
const TEXT =
  "{T}: You choose target creature an opponent controls, and that opponent chooses target creature. Flip a coin. If you win the flip, destroy the creature you chose. If you lose the flip, destroy the creature your opponent chose.";

export default defineCard({
  name: "Mogg Assassin",
  manaCost: "{2}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Goblin", "Assassin"],
  power: 2,
  toughness: 1,
  text: TEXT,
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: ["creature-an-opponent-controls", "creature"],
      opponentChoosesTargets: [1],
      otherChooserControls: 0,
      effect: {
        kind: "flip-coin",
        won: { kind: "destroy", target: 0 },
        lost: { kind: "destroy", target: 1 },
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
