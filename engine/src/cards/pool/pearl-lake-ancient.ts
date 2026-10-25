import { defineCard } from "../define.js";

// EDHREC rank 18044.

const PROWESS = "Prowess (Whenever you cast a noncreature spell, this creature gets +1/+1 until end of turn.)";
const BOUNCE = "Return three lands you control to their owner's hand: Return this creature to its owner's hand.";

export default defineCard({
  name: "Pearl Lake Ancient",
  manaCost: "{5}{U}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Leviathan"],
  power: 6,
  toughness: 7,
  keywords: ["flash"],
  cantBeCountered: true,
  text: `Flash\nThis spell can't be countered.\n${PROWESS}\n${BOUNCE}`,
  triggered: [
    {
      trigger: { on: "cast-spell", who: "you", noncreatureOnly: true },
      targets: [],
      effect: { kind: "modify-pt", target: "source", power: 1, toughness: 1, duration: "end-of-turn" },
      resolve: null,
      text: PROWESS,
    },
  ],
  activated: [
    {
      cost: { mana: null, tap: false, returnToHand: { count: 3, filter: { type: "land" } } },
      targets: [],
      effect: { kind: "return-to-hand", target: "source" },
      resolve: null,
      text: BOUNCE,
    },
  ],
});
