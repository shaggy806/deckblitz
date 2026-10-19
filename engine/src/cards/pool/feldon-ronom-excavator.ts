import { defineCard } from "../define.js";

// EDHREC rank 17385. The Brothers' War.
// Rulings:
//   You must pay all costs and follow all normal timing rules when casting a spell this way.

const CANT_BLOCK_TEXT = "Feldon can't block.";
const DAMAGE_TEXT =
  "Whenever Feldon is dealt damage, exile that many cards from the top of your library. Choose one of them. Until the end of your next turn, you may play that card.";

export default defineCard({
  name: "Feldon, Ronom Excavator",
  manaCost: "{1}{R}",
  colors: ["R"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Artificer"],
  power: 2,
  toughness: 2,
  keywords: ["haste"],
  text: `Haste\n${CANT_BLOCK_TEXT}\n${DAMAGE_TEXT}`,
  static: [{ affects: { scope: "self" }, restrictions: ["cant-block"], text: CANT_BLOCK_TEXT }],
  triggered: [
    {
      trigger: { on: "dealt-damage", who: "self" },
      targets: [],
      // "That many" is the damage dealt (Body of Knowledge's amount); the
      // rest stay exiled with no permission (Tectonic Giant's `choose`).
      effect: { kind: "impulse-exile", amount: { triggerValue: true }, duration: "your-next-turn", choose: 1 },
      resolve: null,
      text: DAMAGE_TEXT,
    },
  ],
});
