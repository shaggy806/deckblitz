import { defineCard } from "../define.js";

// EDHREC rank 9417. Delirium widens the mode count as the spell is cast (the
// modes are chosen then, rule 700.2a).
export default defineCard({
  name: "Let's Play a Game",
  manaCost: "{3}{B}",
  colors: ["B"],
  types: ["sorcery"],
  text: "Delirium — Choose one. If there are four or more card types among cards in your graveyard, choose one or more instead.\n• Creatures your opponents control get -1/-1 until end of turn.\n• Each opponent discards two cards.\n• Each opponent loses 3 life and you gain 3 life.",
  castModal: {
    minModes: 1,
    maxModes: 1,
    maxModesIf: { condition: { kind: "delirium" }, maxModes: 3 },
    modes: [
      {
        text: "Creatures your opponents control get -1/-1 until end of turn.",
        targets: [],
        effect: {
          kind: "modify-pt-all",
          filter: { type: "creature", controlledBy: "opponent" },
          power: -1,
          toughness: -1,
          duration: "end-of-turn",
        },
      },
      {
        text: "Each opponent discards two cards.",
        targets: [],
        effect: { kind: "discard", target: "each-opponent", amount: 2 },
      },
      {
        text: "Each opponent loses 3 life and you gain 3 life.",
        targets: [],
        effect: {
          kind: "sequence",
          effects: [
            { kind: "lose-life", amount: 3, who: "each-opponent" },
            { kind: "gain-life", amount: 3 },
          ],
        },
      },
    ],
  },
});
