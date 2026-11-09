import { defineCard } from "../define.js";

const WATCH_TEXT =
  "Whenever it deals combat damage to a player this turn, exile that many cards from the top of your library. Until the end of your next turn, you may play those cards.";

export default defineCard({
  name: "Fire Giant's Fury",
  manaCost: "{1}{R}",
  colors: ["R"],
  types: ["sorcery"],
  text: `Target Giant you control gets +2/+2 and gains trample until end of turn. ${WATCH_TEXT}`,
  targets: [{ kind: "permanent", whose: "you", filter: { type: "creature", subtype: "Giant" } }],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "modify-pt", target: 0, power: 2, toughness: 2, duration: "end-of-turn" },
      { kind: "grant-keyword", target: 0, keyword: "trample", duration: "end-of-turn" },
      {
        kind: "delayed-trigger",
        at: { whenever: { on: "deals-combat-damage-to-player", who: "self" }, watching: 0 },
        effect: {
          kind: "impulse-exile",
          amount: { triggerValue: true },
          duration: "until-end-of-your-next-turn",
          play: true,
        },
        text: WATCH_TEXT,
      },
    ],
  },
});
