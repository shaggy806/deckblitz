import { defineCard } from "../define.js";

// EDHREC rank 4065. Domain is {2} less per basic land type (an always-true gate
// and the `{ basicLandTypes }` amount doubled); the five keyword grants are one
// static a colour, each read live.

const DOMAIN_TEXT = "Domain — This spell costs {2} less to cast for each basic land type among lands you control.";
const GRANT_TEXT =
  "Each creature you control has vigilance if it's white, hexproof if it's blue, lifelink if it's black, first strike if it's red, and trample if it's green.";

export default defineCard({
  name: "Scion of Draco",
  manaCost: "{12}",
  colors: [],
  types: ["artifact", "creature"],
  subtypes: ["Dragon"],
  power: 4,
  toughness: 4,
  keywords: ["flying"],
  text: `${DOMAIN_TEXT}\nFlying\n${GRANT_TEXT}`,
  selfCostReduction: {
    condition: { kind: "controls", filter: {}, atLeast: 0 },
    reduceGeneric: { product: [{ basicLandTypes: "you" }, 2] },
  },
  static: [
    { affects: { scope: "filter", filter: { type: "creature", controlledBy: "you", colors: ["W"] } }, grantKeywords: ["vigilance"], text: GRANT_TEXT },
    { affects: { scope: "filter", filter: { type: "creature", controlledBy: "you", colors: ["U"] } }, grantKeywords: ["hexproof"], text: "" },
    { affects: { scope: "filter", filter: { type: "creature", controlledBy: "you", colors: ["B"] } }, grantKeywords: ["lifelink"], text: "" },
    { affects: { scope: "filter", filter: { type: "creature", controlledBy: "you", colors: ["R"] } }, grantKeywords: ["first-strike"], text: "" },
    { affects: { scope: "filter", filter: { type: "creature", controlledBy: "you", colors: ["G"] } }, grantKeywords: ["trample"], text: "" },
  ],
});
