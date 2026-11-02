import { defineCard } from "../define.js";

const TEXT =
  "{2}{R}: Reveal cards from the top of your library until you reveal a nonland card. This creature gets +X/+0 until end of turn, where X is that card's mana value. Put the revealed cards on the bottom of your library in any order.";

export default defineCard({
  name: "Goblin Machinist",
  manaCost: "{4}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Goblin"],
  power: 0,
  toughness: 5,
  text: TEXT,
  activated: [
    {
      cost: { mana: "{2}{R}", tap: false },
      targets: [],
      effect: {
        kind: "reveal-until",
        filter: { notTypes: ["land"] },
        then: {
          kind: "modify-pt",
          target: "source",
          power: { manaValueOf: 0 },
          toughness: 0,
          duration: "end-of-turn",
        },
        rest: "bottom-any-order",
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
