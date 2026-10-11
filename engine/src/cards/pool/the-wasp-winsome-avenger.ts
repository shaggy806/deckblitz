import { defineCard } from "../define.js";

// EDHREC rank 14477. Marvel Super Heroes Commander.

const HEXPROOF_TEXT = "When The Wasp enters, target Hero gains hexproof until end of turn.";
const TAP_TEXT = "Whenever The Wasp attacks, tap target creature defending player controls.";

export default defineCard({
  name: "The Wasp, Winsome Avenger",
  manaCost: "{1}{U}",
  colors: ["U"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Hero"],
  power: 2,
  toughness: 1,
  keywords: ["flash", "flying"],
  text: `Flash\nFlying\n${HEXPROOF_TEXT}\n${TAP_TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [{ kind: "permanent", filter: { subtype: "Hero" } }],
      effect: { kind: "grant-keyword", target: 0, keyword: "hexproof", duration: "end-of-turn" },
      resolve: null,
      text: HEXPROOF_TEXT,
    },
    {
      trigger: { on: "attacks", who: "self" },
      targets: ["creature-defending-player-controls"],
      effect: { kind: "tap", target: 0 },
      resolve: null,
      text: TAP_TEXT,
    },
  ],
});
