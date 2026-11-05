import { defineCard } from "../define.js";
import { persist } from "../helpers.js";

// The back face of Eirdu, Carrier of Dawn (eirdu-carrier-of-dawn.ts).
const PERSIST =
  "Each other nontoken creature you control has persist. (When it dies, if it had no -1/-1 counters on it, return it to the battlefield under its owner's control with a -1/-1 counter on it.)";
const TRANSFORM = "At the beginning of your first main phase, you may pay {W}. If you do, transform Isilu.";

export default defineCard({
  name: "Isilu, Carrier of Twilight",
  art: "https://cards.scryfall.io/art_crop/back/b/2/b2d9d5ca-7e15-437a-bdfc-5972b42148fe.jpg",
  colors: ["B"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Elemental", "God"],
  power: 5,
  toughness: 5,
  keywords: ["flying", "lifelink"],
  text: `Flying, lifelink\n${PERSIST}\n${TRANSFORM}`,
  static: [
    {
      affects: { scope: "filter", filter: { type: "creature", token: false, controlledBy: "you" }, excludeSelf: true },
      grantsTriggered: [persist()],
      text: PERSIST,
    },
  ],
  triggered: [
    {
      trigger: { on: "step-begins", step: "precombat-main", who: "you" },
      targets: [],
      effect: {
        kind: "may",
        prompt: "Pay {W} to transform Isilu?",
        cost: "{W}",
        effect: { kind: "transform", target: "source" },
      },
      resolve: null,
      text: TRANSFORM,
    },
  ],
  faces: ["Eirdu, Carrier of Dawn", "Isilu, Carrier of Twilight"],
  transform: true,
});
