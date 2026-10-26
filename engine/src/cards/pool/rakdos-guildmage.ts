import { defineCard } from "../define.js";

// Dissension. EDHREC rank 24145.
//
// Rulings:
//   [2006-05-01] If the second ability is activated during the end step, the token won't be exiled
//     until the following turn's end step.

const SHRINK_TEXT = "{3}{B}, Discard a card: Target creature gets -2/-2 until end of turn.";
const GOBLIN_TEXT =
  "{3}{R}: Create a 2/1 red Goblin creature token with haste. Exile it at the beginning of the next end step.";

export default defineCard({
  name: "Rakdos Guildmage",
  manaCost: "{B/R}{B/R}",
  colors: ["B", "R"],
  types: ["creature"],
  subtypes: ["Zombie", "Shaman"],
  power: 2,
  toughness: 2,
  text: `({B/R} can be paid with either {B} or {R}.)\n${SHRINK_TEXT}\n${GOBLIN_TEXT}`,
  activated: [
    {
      cost: { mana: "{3}{B}", tap: false, discard: { count: 1 } },
      targets: ["creature"],
      effect: { kind: "modify-pt", target: 0, power: -2, toughness: -2, duration: "end-of-turn" },
      resolve: null,
      text: SHRINK_TEXT,
    },
    {
      cost: { mana: "{3}{R}", tap: false },
      targets: [],
      effect: { kind: "create-token", token: "Goblin Token (Rakdos Guildmage)", count: 1, exileAtEndStep: true },
      resolve: null,
      text: GOBLIN_TEXT,
    },
  ],
});
