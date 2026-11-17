import { defineCard } from "../define.js";

const CAST_TEXT = "Whenever you cast a black spell from your hand, Baron Helmut Zemo connives.";
const BOAST_TEXT =
  "Boast — Exile any number of black cards from your graveyard with fifteen or more black mana symbols among their mana costs: Copy those exiled cards. You may cast up to three of the copies without paying their mana costs. (Activate only if this creature attacked this turn and only once each turn.)";

// The boast's cost counts each card's black mana symbols, a hybrid or
// Phyrexian one once (rule 107.4e-f, as devotion does), and is chosen as it's
// paid (602.2b, as 601.2h). The copies are made in exile (rule 707.12) and
// cast one at a time, up to three; the rest cease to exist (704.5e).
export default defineCard({
  name: "Baron Helmut Zemo",
  manaCost: "{B}{B}{B}",
  colors: ["B"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Noble", "Villain"],
  power: 3,
  toughness: 3,
  text: `${CAST_TEXT}\n${BOAST_TEXT}`,
  triggered: [
    {
      trigger: { on: "cast-spell", who: "you", from: "hand", filter: { colors: ["B"] } },
      targets: [],
      effect: { kind: "connive", target: "source" },
      resolve: null,
      text: CAST_TEXT,
    },
  ],
  activated: [
    {
      cost: {
        mana: null,
        tap: false,
        collectEvidence: { totalManaSymbols: { color: "B", atLeast: 15 }, filter: { colors: ["B"] } },
      },
      targets: [],
      effect: {
        kind: "cast-now",
        from: { set: { paid: "exiled" } },
        copies: 1,
        repeat: true,
        upTo: 3,
        free: true,
      },
      boast: true,
      resolve: null,
      text: BOAST_TEXT,
    },
  ],
});
