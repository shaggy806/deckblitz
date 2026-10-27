import { defineCard } from "../define.js";

// "Unless a player has this creature deal 4 damage to them": Browbeat's
// rhystic `unless` (`takeDamage`), on a once-a-turn ability whose cost
// discards at random.

const TEXT =
  "Discard a card at random: This creature gets +2/+2 until end of turn unless a player has this creature deal 4 damage to them. Activate only once each turn.";

export default defineCard({
  name: "Barbarian Bully",
  manaCost: "{2}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Human", "Barbarian"],
  power: 2,
  toughness: 2,
  text: TEXT,
  activated: [
    {
      cost: { mana: null, tap: false, discard: { count: 1, random: true } },
      targets: [],
      effect: {
        kind: "unless",
        chooser: "any-player",
        options: [{ takeDamage: 4, text: "Have Barbarian Bully deal 4 damage to you" }],
        otherwise: { kind: "modify-pt", target: "source", power: 2, toughness: 2, duration: "end-of-turn" },
      },
      resolve: null,
      oncePerTurn: true,
      text: TEXT,
    },
  ],
});
