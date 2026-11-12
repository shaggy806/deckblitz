import { defineCard } from "../define.js";

// Mystery Booster Commander Edition. The second ability is a `put-into-exile`
// trigger narrowed to exiles a resolving spell or ability of yours did
// (`byEffectOf`) — its own attack trigger's among them, though the opponents
// do the exiling — and "those cards" are its batch.
const ATTACK_TEXT = "Whenever The Madcap Jester attacks, each opponent exiles the top card of their library.";
const PLAY_TEXT =
  "Whenever a spell or ability you control causes one or more cards to be exiled from an opponent's library, you may play those cards until the end of your next turn. Mana of any type can be spent to cast spells this way.";

export default defineCard({
  name: "The Madcap Jester",
  manaCost: "{1}{U}{B}{R}",
  colors: ["U", "B", "R"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Clown", "Wizard"],
  power: 3,
  toughness: 2,
  text: `${ATTACK_TEXT}\n${PLAY_TEXT}`,
  triggered: [
    {
      trigger: { on: "attacks", who: "self" },
      targets: [],
      effect: { kind: "exile-from-library", whose: "each-opponent", amount: 1 },
      resolve: null,
      text: ATTACK_TEXT,
    },
    {
      trigger: { on: "put-into-exile", who: "opponent", from: ["library"], byEffectOf: "you" },
      targets: [],
      effect: {
        kind: "grant-play",
        cards: "trigger-batch",
        duration: "until-end-of-your-next-turn",
        play: true,
        spendAs: "any-type",
      },
      resolve: null,
      text: PLAY_TEXT,
    },
  ],
});
