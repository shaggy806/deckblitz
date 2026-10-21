import { defineCard } from "../define.js";

// Rulings:
//   [2020-06-23] You choose whether to sacrifice a creature and which to sacrifice as Dire Fleet
//     Warmonger's ability resolves.
//   [2020-06-23] While resolving Dire Fleet Warmonger's ability, you can't sacrifice multiple
//     creatures to give it more than +2/+2 and trample.

export default defineCard({
  name: "Dire Fleet Warmonger",
  manaCost: "{1}{B}{R}",
  colors: ["B", "R"],
  types: ["creature"],
  subtypes: ["Orc", "Pirate"],
  power: 3,
  toughness: 3,
  text: "At the beginning of combat on your turn, you may sacrifice another creature. If you do, this creature gets +2/+2 and gains trample until end of turn. (It can deal excess combat damage to the player or planeswalker it's attacking.)",
  triggered: [
    {
      trigger: { on: "step-begins", step: "begin-combat", who: "you" },
      targets: [],
      effect: {
        kind: "each-player-may",
        who: "you",
        options: [{ sacrifice: { type: "creature" }, exceptSource: true, text: "Sacrifice another creature" }],
        ifDid: {
          kind: "sequence",
          effects: [
            { kind: "modify-pt", target: "source", power: 2, toughness: 2, duration: "end-of-turn" },
            { kind: "grant-keyword", target: "source", keyword: "trample", duration: "end-of-turn" },
          ],
        },
      },
      resolve: null,
      text: "At the beginning of combat on your turn, you may sacrifice another creature. If you do, this creature gets +2/+2 and gains trample until end of turn.",
    },
  ],
});
