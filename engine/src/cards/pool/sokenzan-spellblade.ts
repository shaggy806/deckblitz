import { defineCard } from "../define.js";

// EDHREC rank 27744.

const BUSHIDO = "Bushido 1 (Whenever this creature blocks or becomes blocked, it gets +1/+1 until end of turn.)";

export default defineCard({
  name: "Sokenzan Spellblade",
  manaCost: "{4}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Ogre", "Samurai", "Shaman"],
  power: 2,
  toughness: 3,
  text: `${BUSHIDO}\n{1}{R}: This creature gets +X/+0 until end of turn, where X is the number of cards in your hand.`,
  activated: [
    {
      cost: { mana: "{1}{R}", tap: false },
      targets: [],
      // Kitsune Loreweaver's shape, on power: X is read as the ability resolves.
      effect: { kind: "modify-pt", target: "source", power: { cardsInHand: "you" }, toughness: 0, duration: "end-of-turn" },
      resolve: null,
      text: "{1}{R}: This creature gets +X/+0 until end of turn, where X is the number of cards in your hand.",
    },
  ],
  triggered: [
    {
      trigger: { on: "blocks", who: "self" },
      targets: [],
      effect: { kind: "modify-pt", target: "source", power: 1, toughness: 1, duration: "end-of-turn" },
      resolve: null,
      text: BUSHIDO,
    },
    {
      trigger: { on: "becomes-blocked", who: "self" },
      targets: [],
      effect: { kind: "modify-pt", target: "source", power: 1, toughness: 1, duration: "end-of-turn" },
      resolve: null,
      text: BUSHIDO,
    },
  ],
});
