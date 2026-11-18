import { defineCard } from "../define.js";

// Hidetsugu Consumes All's back face. Its first trigger is once per damage
// event, whatever it was dealt to and however many (the ruling, rule 603.2c).
// The second is per player dealt damage, its intervening "if" (rule 603.4)
// what this object has dealt that player this turn — since it last came back
// (rule 400.7), all of it, combat or not — asked as it triggers and again as
// it resolves, as it last existed if it has left.

const COUNTER = "Whenever this creature deals damage, put a +1/+1 counter on it.";
const LOSE =
  "Whenever this creature deals damage to a player, if it has dealt 10 or more damage to that player this turn, they lose the game.";

export default defineCard({
  name: "Vessel of the All-Consuming",
  art: "https://cards.scryfall.io/art_crop/back/8/e/8e910464-329a-4de1-930a-be85b1956676.jpg",
  colors: ["B", "R"],
  types: ["enchantment", "creature"],
  subtypes: ["Ogre", "Shaman"],
  power: 3,
  toughness: 3,
  keywords: ["trample"],
  text: `Trample\n${COUNTER}\n${LOSE}`,
  triggered: [
    {
      trigger: { on: "deals-damage", who: "self" },
      targets: [],
      effect: { kind: "add-counter", target: "source", counter: "+1/+1", amount: 1 },
      resolve: null,
      text: COUNTER,
    },
    {
      trigger: { on: "deals-damage", who: "self", to: "player" },
      condition: { kind: "damage-dealt-this-turn", who: "any-player", bySelf: true, against: "that-player", atLeast: 10 },
      targets: [],
      effect: { kind: "lose-game", who: "trigger-player" },
      resolve: null,
      text: LOSE,
    },
  ],
  faces: ["Hidetsugu Consumes All", "Vessel of the All-Consuming"],
  transform: true,
});
