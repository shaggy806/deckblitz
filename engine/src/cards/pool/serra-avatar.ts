import { defineCard } from "../define.js";

// Mirage. A characteristic-defining ability (rule 604.3, layer 7a) read
// from its controller's life total — its owner's in every other zone.

const CDA = "Serra Avatar's power and toughness are each equal to your life total.";
const SHUFFLE = "When Serra Avatar is put into a graveyard from anywhere, shuffle it into its owner's library.";

export default defineCard({
  name: "Serra Avatar",
  manaCost: "{4}{W}{W}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Avatar"],
  power: 0,
  toughness: 0,
  text: `${CDA}\n${SHUFFLE}`,
  static: [
    {
      affects: { scope: "self" },
      setBasePtFromCount: { countOf: "your-life-total", plusPower: 0, plusToughness: 0 },
      text: CDA,
    },
  ],
  triggered: [
    {
      trigger: { on: "put-into-graveyard", who: "self" },
      fromGraveyard: true,
      targets: [],
      effect: { kind: "shuffle-into-library", target: "source" },
      resolve: null,
      text: SHUFFLE,
    },
  ],
});
