import { defineCard } from "../define.js";
import { crew, crewText } from "../helpers.js";

// Cycling with {X} in its cost: the cycle trigger reads that X as its trigger
// value (Shark Typhoon's shape).

const CYCLE_TEXT =
  'When you cycle this card, create X 1/1 colorless Pilot creature tokens with "This token saddles Mounts and crews Vehicles as though its power were 2 greater."';

export default defineCard({
  name: "Valor's Flagship",
  manaCost: "{4}{W}{W}{W}",
  colors: ["W"],
  supertypes: ["legendary"],
  types: ["artifact"],
  subtypes: ["Vehicle"],
  power: 7,
  toughness: 7,
  keywords: ["flying", "first-strike", "lifelink"],
  cycling: { cost: "{X}{2}{W}" },
  text: `Flying, first strike, lifelink\n${crewText(3)}\nCycling {X}{2}{W} ({X}{2}{W}, Discard this card: Draw a card.)\n${CYCLE_TEXT}`,
  activated: [crew(3, crewText(3))],
  triggered: [
    {
      trigger: { on: "this-cycled" },
      targets: [],
      effect: { kind: "create-token", token: "Pilot Token", count: { triggerValue: true } },
      resolve: null,
      text: CYCLE_TEXT,
    },
  ],
});
