import { defineCard } from "../define.js";

// EDHREC rank 14198.
//
// Warp-Strike is an ability word-like label: the ability is the {3} one. The
// return is a delayed ability at the owner's next declare attackers step
// (`returnOnOwnersTurn`), resolving once that player has declared attackers —
// even none, the ruling says — and putting Noctis onto the battlefield tapped
// and attacking (rule 508.4: its controller chooses what it attacks; it was
// never declared, so no "whenever attacks" sees it). "It can't be blocked
// that combat" is the returned permanent, read as the return put it there.
// The first ability is The Blue Spirit's "enters during combat" (a trigger
// condition, rule 603.1) with Kor Outfitter's "you may attach".
const ATTACH =
  "Whenever a creature you control enters during combat, you may attach target Equipment you control to target " +
  "creature you control.";
const WARP =
  "Warp-Strike — {3}: Exile Noctis. Return it to the battlefield under its owner's control tapped and attacking at " +
  "the beginning of that player's next declare attackers step. It can't be blocked that combat.";

export default defineCard({
  name: "Noctis, Heir Apparent",
  manaCost: "{W}{U}{B}",
  colors: ["W", "U", "B"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Noble"],
  power: 2,
  toughness: 3,
  text: `${ATTACH}\n${WARP}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "you-control", filter: { type: "creature" } },
      whileCondition: { kind: "turn-structure", duringCombat: true },
      targets: [{ kind: "permanent", whose: "you", filter: { subtype: "Equipment" } }, "creature-you-control"],
      effect: {
        kind: "may",
        prompt: "Attach the Equipment to the creature?",
        effect: { kind: "attach", target: 1, attachment: 0 },
      },
      resolve: null,
      text: ATTACH,
    },
  ],
  activated: [
    {
      cost: { mana: "{3}", tap: false },
      targets: [],
      effect: {
        kind: "flicker",
        target: "source",
        returnAt: { step: "declare-attackers", whose: "you" },
        returnOnOwnersTurn: true,
        tapped: true,
        attacking: "choose",
        returnThen: {
          kind: "restrict",
          filter: { thisWay: "put-onto-battlefield" },
          asItResolves: true,
          restrictions: ["cant-be-blocked"],
          duration: "until-end-of-combat",
        },
        returnText:
          "Return Noctis to the battlefield under its owner's control tapped and attacking. It can't be blocked " +
          "that combat.",
      },
      resolve: null,
      text: WARP,
    },
  ],
});
