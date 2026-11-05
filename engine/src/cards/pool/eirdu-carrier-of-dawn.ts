import { defineCard } from "../define.js";

// A transforming double-faced card; the back face is Isilu, Carrier of
// Twilight (isilu-carrier-of-twilight.ts).
const CONVOKE =
  "Creature spells you cast have convoke. (Your creatures can help cast those spells. Each creature you tap while casting a creature spell pays for {1} or one mana of that creature's color.)";
const TRANSFORM = "At the beginning of your first main phase, you may pay {B}. If you do, transform Eirdu.";

export default defineCard({
  name: "Eirdu, Carrier of Dawn",
  manaCost: "{3}{W}{W}",
  colors: ["W"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Elemental", "God"],
  power: 5,
  toughness: 5,
  keywords: ["flying", "lifelink"],
  text: `Flying, lifelink\n${CONVOKE}\n${TRANSFORM}`,
  static: [
    {
      affects: { scope: "self" },
      grantsToSpells: { filter: { type: "creature" }, convoke: true },
      text: CONVOKE,
    },
  ],
  triggered: [
    {
      trigger: { on: "step-begins", step: "precombat-main", who: "you" },
      targets: [],
      effect: {
        kind: "may",
        prompt: "Pay {B} to transform Eirdu?",
        cost: "{B}",
        effect: { kind: "transform", target: "source" },
      },
      resolve: null,
      text: TRANSFORM,
    },
  ],
  faces: ["Eirdu, Carrier of Dawn", "Isilu, Carrier of Twilight"],
  transform: true,
});
