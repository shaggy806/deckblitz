import { defineCard } from "../define.js";

// EDHREC rank 15227. Glorybringer's exert, its "when you do" Reckless
// Impulse's exile.

const EXERT_TEXT =
  "You may exert Anep as it attacks. When you do, exile the top two cards of your library. Until the end of your next turn, you may play those cards.";

export default defineCard({
  name: "Anep, Vizier of Hazoret",
  manaCost: "{2}{R}",
  colors: ["R"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Jackal", "Warrior"],
  power: 4,
  toughness: 2,
  keywords: ["trample"],
  text: `Trample\n${EXERT_TEXT} (An exerted creature won't untap during your next untap step.)`,
  static: [{ affects: { scope: "self" }, exertAsItAttacks: {}, text: EXERT_TEXT }],
  triggered: [
    {
      trigger: { on: "exerted", who: "self", asItAttacks: true },
      targets: [],
      effect: { kind: "impulse-exile", amount: 2, duration: "your-next-turn" },
      resolve: null,
      text: EXERT_TEXT,
    },
  ],
});
