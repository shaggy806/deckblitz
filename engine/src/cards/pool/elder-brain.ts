import { defineCard } from "../define.js";

const TEXT =
  "Whenever this creature attacks a player, exile all cards from that player's hand, then they draw that many cards. You may play lands and cast spells from among the exiled cards for as long as they remain exiled. If you cast a spell this way, you may spend mana as though it were mana of any color to cast it.";

export default defineCard({
  name: "Elder Brain",
  manaCost: "{5}{B}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Horror"],
  power: 6,
  toughness: 6,
  keywords: ["menace"],
  text: `Menace\n${TEXT}`,
  triggered: [
    {
      trigger: { on: "attacks", who: "self", defender: "player" },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "exile-graveyard", target: "trigger-player", fromHand: "only" },
          { kind: "draw", amount: { thisWay: "exiled-from-hand" }, who: "trigger-player" },
          { kind: "grant-play", cards: { thisWay: "exiled-from-hand" }, duration: "while-exiled", play: true, spendAs: "any-color" },
        ],
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
