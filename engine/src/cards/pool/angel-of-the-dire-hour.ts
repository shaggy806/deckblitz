import { defineCard } from "../define.js";

// EDHREC rank 8959. "If you cast it from your hand" is the intervening-if on
// the source's own entry (Feasting Troll King's); outside combat nothing is
// attacking and the trigger does nothing (the ruling).

export default defineCard({
  name: "Angel of the Dire Hour",
  manaCost: "{5}{W}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Angel"],
  power: 5,
  toughness: 4,
  keywords: ["flash", "flying"],
  text: "Flash\nFlying\nWhen this creature enters, if you cast it from your hand, exile all attacking creatures.",
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      condition: { kind: "source", filter: { cast: true, castBy: "you", castFrom: "hand" } },
      targets: [],
      effect: { kind: "exile-all", filter: { type: "creature", attacking: true } },
      resolve: null,
      text: "When this creature enters, if you cast it from your hand, exile all attacking creatures.",
    },
  ],
});
