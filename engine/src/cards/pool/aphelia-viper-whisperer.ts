import { defineCard } from "../define.js";

// Once per damaged player (the batch's default): two Snakes connecting with
// one player halve them once, each damaged player separately. Damage happens
// first, so the half is of what's left (the ruling).
const WATCH_TEXT =
  "Until end of turn, whenever one or more Gorgons and/or Snakes you control deal combat damage to a player, that player loses half their life, rounded up.";
const ACTIVATED_TEXT = `{4}{B}: ${WATCH_TEXT}`;
const ATTACK_TEXT =
  "Whenever Aphelia attacks, you may pay {1}{B/G}. If you do, create a 1/1 black Snake creature token with deathtouch.";

export default defineCard({
  name: "Aphelia, Viper Whisperer",
  manaCost: "{1}{B}",
  colors: ["B"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Gorgon", "Assassin"],
  power: 1,
  toughness: 3,
  keywords: ["deathtouch"],
  text: `Deathtouch\n${ATTACK_TEXT}\n${ACTIVATED_TEXT}`,
  activated: [
    {
      cost: { mana: "{4}{B}", tap: false },
      targets: [],
      effect: {
        kind: "delayed-trigger",
        at: {
          whenever: {
            on: "deals-damage-batch",
            who: "you-control",
            filter: { subtypes: ["Gorgon", "Snake"] },
            to: "player",
            combat: true,
          },
        },
        effect: {
          kind: "lose-life",
          who: "trigger-player",
          amount: { half: { lifeTotal: "each" }, round: "up" },
        },
        text: WATCH_TEXT,
      },
      resolve: null,
      text: ACTIVATED_TEXT,
    },
  ],
  triggered: [
    {
      trigger: { on: "attacks", who: "self" },
      targets: [],
      effect: {
        kind: "may",
        prompt: "Pay {1}{B/G} to create a 1/1 black Snake creature token with deathtouch?",
        cost: "{1}{B/G}",
        effect: { kind: "create-token", token: "Black Deathtouch Snake Token", count: 1 },
      },
      resolve: null,
      text: ATTACK_TEXT,
    },
  ],
});
