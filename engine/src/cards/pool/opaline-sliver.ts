import { defineCard } from "../define.js";

const GRANTED_TEXT = "Whenever this permanent becomes the target of a spell an opponent controls, you may draw a card.";

export default defineCard({
  name: "Opaline Sliver",
  manaCost: "{1}{W}{U}",
  colors: ["W", "U"],
  types: ["creature"],
  subtypes: ["Sliver"],
  power: 2,
  toughness: 2,
  text: `All Slivers have "${GRANTED_TEXT}"`,
  static: [
    {
      // Every Sliver, whoever controls it: the granted trigger is that
      // Sliver's own, so "an opponent" and "you" are its controller's.
      affects: { scope: "filter", filter: { subtype: "Sliver" } },
      grantsTriggered: [
        {
          trigger: { on: "becomes-target", who: "self", byOpponentOnly: true, spellOnly: true },
          targets: [],
          effect: { kind: "may", prompt: "Draw a card?", effect: { kind: "draw", amount: 1 } },
          resolve: null,
          text: GRANTED_TEXT,
        },
      ],
      text: `All Slivers have "${GRANTED_TEXT}"`,
    },
  ],
});
