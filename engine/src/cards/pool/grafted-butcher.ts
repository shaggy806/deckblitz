import { defineCard } from "../define.js";

// EDHREC rank 9131.
//
// The menace goes to the Phyrexians you control as the trigger resolves (rule
// 611.2c — one entering later doesn't gain it); the anthem is for the others
// only. The return is activated from the graveyard (Dutiful Griffin's shape):
// the card stays there as the cost is paid, and returns only if it's still
// the same card when the ability resolves (rule 400.7).

const ENTER_TEXT = "When this creature enters, Phyrexians you control gain menace until end of turn.";
const ANTHEM_TEXT = "Other Phyrexians you control get +1/+1.";
const RETURN_TEXT =
  "{3}{B}, Sacrifice an artifact or creature: Return this card from your graveyard to the battlefield. Activate only as a sorcery.";

export default defineCard({
  name: "Grafted Butcher",
  manaCost: "{1}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Phyrexian", "Samurai"],
  power: 2,
  toughness: 2,
  text: `${ENTER_TEXT}\n${ANTHEM_TEXT}\n${RETURN_TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: {
        kind: "grant-keyword-all",
        filter: { subtype: "Phyrexian", controlledBy: "you" },
        keyword: "menace",
        duration: "end-of-turn",
      },
      resolve: null,
      text: ENTER_TEXT,
    },
  ],
  static: [
    {
      affects: { scope: "creatures-you-control", subtype: "Phyrexian", excludeSelf: true },
      grantPt: [1, 1],
      text: ANTHEM_TEXT,
    },
  ],
  activated: [
    {
      cost: {
        mana: "{3}{B}",
        tap: false,
        sacrifice: { filter: { typesAnyOf: ["artifact", "creature"] } },
      },
      zone: "graveyard",
      staysInZone: true,
      sorcerySpeed: true,
      targets: [],
      effect: { kind: "put-onto-battlefield", target: "source" },
      resolve: null,
      text: RETURN_TEXT,
    },
  ],
});
