import { defineCard } from "../define.js";

// The back face of Enduring Angel. Its power and toughness are a
// characteristic-defining ability (rule 604.3, layer 7a) read from its
// controller's life total; doubling it is a set life total (rule 119.5).

const HEXPROOF_TEXT = "You have hexproof.";
const CDA_TEXT = "Angelic Enforcer's power and toughness are each equal to your life total.";
const ATTACK_TEXT = "Whenever this creature attacks, double your life total.";

export default defineCard({
  name: "Angelic Enforcer",
  art: "https://cards.scryfall.io/art_crop/back/a/2/a204c2a3-a899-4b70-8825-7e085b655ed0.jpg",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Angel"],
  power: 0,
  toughness: 0,
  keywords: ["flying"],
  text: `Flying\n${HEXPROOF_TEXT}\n${CDA_TEXT}\n${ATTACK_TEXT}`,
  triggered: [
    {
      trigger: { on: "attacks", who: "self" },
      targets: [],
      effect: { kind: "set-life-total", who: "you", amount: { product: [{ lifeTotal: "you" }, 2] } },
      resolve: null,
      text: ATTACK_TEXT,
    },
  ],
  static: [
    { affects: { scope: "self" }, playerKeywords: ["hexproof"], text: HEXPROOF_TEXT },
    {
      affects: { scope: "self" },
      setBasePtFromCount: { countOf: "your-life-total", plusPower: 0, plusToughness: 0 },
      text: CDA_TEXT,
    },
  ],
  faces: ["Enduring Angel", "Angelic Enforcer"],
  transform: true,
});
