import { defineCard } from "../define.js";

/** Its last ability works while it's suspended (`whileSuspended`). */
export default defineCard({
  name: "Deep-Sea Kraken",
  manaCost: "{7}{U}{U}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Kraken"],
  power: 6,
  toughness: 6,
  keywords: ["unblockable"],
  text: "This creature can't be blocked.\nSuspend 9—{2}{U}\nWhenever an opponent casts a spell, if this card is suspended, remove a time counter from it.",
  suspend: { n: 9, cost: "{2}{U}" },
  triggered: [
    {
      trigger: { on: "cast-spell", who: "opponent" },
      whileSuspended: true,
      targets: [],
      effect: { kind: "remove-counter", target: "source", counter: "time", amount: 1 },
      resolve: null,
      text: "Whenever an opponent casts a spell, if this card is suspended, remove a time counter from it.",
    },
  ],
});
