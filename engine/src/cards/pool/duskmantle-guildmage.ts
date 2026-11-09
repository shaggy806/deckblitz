import { defineCard } from "../define.js";

// "That player" is the one whose graveyard took the card: a token permanent
// isn't a card (its ruling). Each resolved activation is its own delayed
// ability, so two of them lose two life a card (the ruling).
const WATCH_TEXT = "Whenever a card is put into an opponent's graveyard from anywhere this turn, that player loses 1 life.";

export default defineCard({
  name: "Duskmantle Guildmage",
  manaCost: "{U}{B}",
  colors: ["U", "B"],
  types: ["creature"],
  subtypes: ["Human", "Wizard"],
  power: 2,
  toughness: 2,
  text: `{1}{U}{B}: ${WATCH_TEXT}\n{2}{U}{B}: Target player mills two cards.`,
  activated: [
    {
      cost: { mana: "{1}{U}{B}", tap: false },
      targets: [],
      effect: {
        kind: "delayed-trigger",
        at: { whenever: { on: "put-into-graveyard", who: "opponent" } },
        effect: { kind: "lose-life", amount: 1, who: { ownerOf: "trigger-object" } },
        text: WATCH_TEXT,
      },
      resolve: null,
      text: `{1}{U}{B}: ${WATCH_TEXT}`,
    },
    {
      cost: { mana: "{2}{U}{B}", tap: false },
      targets: ["player"],
      effect: { kind: "mill", target: 0, amount: 2 },
      resolve: null,
      text: "{2}{U}{B}: Target player mills two cards.",
    },
  ],
});
