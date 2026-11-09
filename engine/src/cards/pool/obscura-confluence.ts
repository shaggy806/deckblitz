import { defineCard } from "../define.js";

const HUMBLE = "Until end of turn, target creature loses all abilities and has base power and toughness 1/1.";
const CONNIVE =
  "Target creature connives. (Draw a card, then discard a card. If you discarded a nonland card, put a +1/+1 counter on that creature.)";
const RETURN = "Target player returns a creature card from their graveyard to their hand.";

export default defineCard({
  name: "Obscura Confluence",
  manaCost: "{1}{W}{U}{B}",
  colors: ["W", "U", "B"],
  types: ["instant"],
  text: `Choose three. You may choose the same mode more than once.\n• ${HUMBLE}\n• ${CONNIVE}\n• ${RETURN}`,
  targets: [],
  castModal: {
    minModes: 3,
    maxModes: 3,
    repeatModes: true,
    modes: [
      {
        text: HUMBLE,
        targets: ["creature"],
        effect: {
          kind: "become",
          target: 0,
          power: 1,
          toughness: 1,
          loseAbilities: true,
          duration: "end-of-turn",
        },
      },
      {
        text: CONNIVE,
        targets: ["creature"],
        effect: { kind: "connive", target: 0 },
      },
      {
        text: RETURN,
        targets: ["player"],
        effect: {
          kind: "for-each-player",
          who: { target: 0 },
          effect: {
            kind: "look-and-choose",
            player: "that-player",
            zone: "graveyard",
            filter: { type: "creature" },
            min: 1,
            max: 1,
            destination: "hand",
            leftover: "stay",
          },
        },
      },
    ],
  },
});
