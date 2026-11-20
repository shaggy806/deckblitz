import { defineCard } from "../define.js";

// EDHREC rank 18755.
//
// - The return works only from the graveyard (rule 113.6k — `fromGraveyard`),
//   Nether Traitor's optional payment; a battle the spell damages counts as
//   an opponent does (`orBattle`), whoever protects it.
// - Satyr Firedancer's trigger: once per damage event per recipient, so a
//   spell that hits two opponents triggers twice (each a payment to make).
// - "It" is the card put onto the battlefield: `"source"` follows it there
//   within the same resolution (as unearth's haste does).
const RETURN_TEXT =
  "Whenever an instant or sorcery spell you control deals damage to an opponent or battle, you may pay {R}. If you do, return this card from your graveyard to the battlefield. It gains haste until end of turn.";

export default defineCard({
  name: "Bloodfeather Phoenix",
  manaCost: "{1}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Phoenix"],
  power: 2,
  toughness: 2,
  keywords: ["flying"],
  static: [{ affects: { scope: "self" }, restrictions: ["cant-block"], text: "This creature can't block." }],
  text: `Flying\nThis creature can't block.\n${RETURN_TEXT}`,
  triggered: [
    {
      fromGraveyard: true,
      trigger: {
        on: "deals-damage",
        who: "you-control",
        filter: { typesAnyOf: ["instant", "sorcery"] },
        to: "opponent",
        orBattle: true,
      },
      targets: [],
      effect: {
        kind: "may",
        prompt: "Pay {R} to return Bloodfeather Phoenix to the battlefield?",
        cost: "{R}",
        effect: {
          kind: "sequence",
          effects: [
            { kind: "put-onto-battlefield", target: "source" },
            { kind: "grant-keyword", target: "source", keyword: "haste", duration: "end-of-turn" },
          ],
        },
      },
      resolve: null,
      text: RETURN_TEXT,
    },
  ],
});
