import { defineCard } from "../define.js";

// EDHREC rank 9943. Hunted Horror's shape: the target opponent creates the
// token, a legendary one named The Void.
const ENTER_TEXT =
  'When The Sentry enters, target opponent creates The Void, a legendary 5/5 black Horror Villain creature token with flying, indestructible, and "The Void attacks each combat if able."';

export default defineCard({
  name: "The Sentry, Golden Guardian",
  manaCost: "{3}{W}",
  colors: ["W"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Hero"],
  power: 5,
  toughness: 5,
  keywords: ["flying", "vigilance", "indestructible"],
  text: `Flying, vigilance, indestructible\n${ENTER_TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: ["opponent"],
      effect: { kind: "create-token", token: "The Void", count: 1, who: "target-controller" },
      resolve: null,
      text: ENTER_TEXT,
    },
  ],
});
