import { defineCard } from "../define.js";

// Chapter II counts every rad counter among the players still in the game as
// it resolves (the ruling). Chapter III gives a Zombie Mutant two counters,
// not four (the ruling): one placement per creature that's either.
const I_TEXT = "I — Each player gets three rad counters.";
const II_TEXT =
  "II — Create X 2/2 black Zombie Mutant creature tokens, where X is the total number of rad counters among players.";
const III_TEXT = "III — Put two +1/+1 counters on each creature you control that's a Zombie or Mutant.";

export default defineCard({
  name: "Vault 12: The Necropolis",
  manaCost: "{4}{B}{B}",
  colors: ["B"],
  types: ["enchantment"],
  subtypes: ["Saga"],
  text:
    "(As this Saga enters and after your draw step, add a lore counter. Sacrifice after III.)\n" +
    `${I_TEXT}\n${II_TEXT}\n${III_TEXT}`,
  chapters: [
    {
      at: [1],
      targets: [],
      effect: { kind: "add-player-counters", counter: "rad", amount: 3, who: "each-player" },
      resolve: null,
      text: I_TEXT,
    },
    {
      at: [2],
      targets: [],
      effect: {
        kind: "create-token",
        token: "Zombie Mutant Token",
        count: { playerCounters: "rad", who: "each-player" },
      },
      resolve: null,
      text: II_TEXT,
    },
    {
      at: [3],
      targets: [],
      effect: {
        kind: "add-counter-all",
        filter: { type: "creature", controlledBy: "you", subtypes: ["Zombie", "Mutant"] },
        counter: "+1/+1",
        amount: 2,
      },
      resolve: null,
      text: III_TEXT,
    },
  ],
});
