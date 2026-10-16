import { defineCard } from "../define.js";

const UNTAP_TEXT = "{T}: Untap another target permanent you control.";
const TAP_TEXT = "{T}, Collect evidence 3: Tap target creature you don't control.";

export default defineCard({
  name: "Forensic Researcher",
  manaCost: "{2}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Merfolk", "Detective"],
  power: 1,
  toughness: 3,
  text: `${UNTAP_TEXT}\n${TAP_TEXT} (To collect evidence 3, exile cards with total mana value 3 or greater from your graveyard.)`,
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: [{ kind: "other", of: { kind: "permanent", whose: "you", filter: {} } }],
      effect: { kind: "untap", target: 0 },
      resolve: null,
      text: UNTAP_TEXT,
    },
    {
      cost: { mana: null, tap: true, collectEvidence: 3 },
      targets: ["creature-an-opponent-controls"],
      effect: { kind: "tap", target: 0 },
      resolve: null,
      text: TAP_TEXT,
    },
  ],
});
