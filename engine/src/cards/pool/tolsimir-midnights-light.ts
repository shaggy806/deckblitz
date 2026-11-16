import { defineCard } from "../define.js";

// EDHREC rank 10815.
//
// "If Tolsimir attacked this combat" is an intervening if (rule 603.4) over
// this combat phase's declaration: Tolsimir declared as an attacker with the
// Wolf (or in an earlier declaration of the same combat), still so once it's
// been removed from combat (rule 506.4), never across a later combat phase
// (`attackedThisCombat`). The target needn't be the Wolf's defender; a
// creature that can't block it (it attacks someone else) is under a
// requirement it can't meet (rule 509.1c).
const VOJA_TEXT =
  "When Tolsimir enters, create Voja Fenstalker, a legendary 5/5 green and white Wolf creature token with trample.";
const WOLF_TEXT =
  "Whenever a Wolf you control attacks, if Tolsimir attacked this combat, target creature an opponent controls blocks that Wolf this combat if able.";

export default defineCard({
  name: "Tolsimir, Midnight's Light",
  manaCost: "{2}{G}{W}{W}",
  colors: ["W", "G"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Elf", "Scout"],
  power: 3,
  toughness: 2,
  keywords: ["lifelink"],
  text: `Lifelink\n${VOJA_TEXT}\n${WOLF_TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: { kind: "create-token", token: "Voja Fenstalker", count: 1 },
      resolve: null,
      text: VOJA_TEXT,
    },
    {
      trigger: { on: "attacks", who: "you-control", filter: { subtype: "Wolf" } },
      condition: { kind: "source", filter: { attackedThisCombat: true } },
      targets: ["creature-an-opponent-controls"],
      effect: {
        kind: "restrict",
        target: 0,
        restrictions: [{ kind: "must-block", attacker: "trigger-object" }],
        duration: "until-end-of-combat",
      },
      resolve: null,
      text: WOLF_TEXT,
    },
  ],
});
