import { defineCard } from "../define.js";

// EDHREC rank 21672. Banishing Light's exile with its linked return (rule
// 610.3), and a second, separate enters trigger for the Mercenary. Ruling: if
// it leaves before the exile trigger resolves, nothing is exiled.
const EXILE_TEXT =
  "When this enchantment enters, exile target nonland permanent an opponent controls until this enchantment leaves the battlefield.";
const TOKEN_TEXT =
  'When this enchantment enters, create a 1/1 red Mercenary creature token with "{T}: Target creature you control gets +1/+0 until end of turn. Activate only as a sorcery."';

export default defineCard({
  name: "Lassoed by the Law",
  manaCost: "{3}{W}",
  colors: ["W"],
  types: ["enchantment"],
  text: `${EXILE_TEXT}\n${TOKEN_TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: ["nonland-permanent-an-opponent-controls"],
      effect: { kind: "exile", target: 0, untilSourceLeaves: true },
      resolve: null,
      text: EXILE_TEXT,
    },
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: { kind: "create-token", token: "Mercenary Token", count: 1 },
      resolve: null,
      text: TOKEN_TEXT,
    },
    {
      // The exile's linked return (rule 610.3).
      trigger: { on: "leaves-battlefield", who: "self" },
      targets: [],
      effect: { kind: "return-exiled-by-source" },
      resolve: null,
      text: "When this enchantment leaves the battlefield, return the exiled card.",
    },
  ],
});
