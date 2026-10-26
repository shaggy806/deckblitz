import { defineCard } from "../define.js";

// EDHREC rank 29849.
//
// Rulings:
//   [2004-10-04] Can destroy an opponent's knight.
//   [2004-10-04] If no other Knights are on the battlefield, pay the mana or destroy this card.
//
// The Knight is targeted as the trigger goes on the stack (it may be this
// one); as it resolves you may pay {U} (Chaos Spewer's shape), and if you
// don't, the target is destroyed.

const ETB_TEXT = "When this creature enters, you may pay {U}. If you don't, destroy target Knight and it can't be regenerated.";

export default defineCard({
  name: "Knight of the Mists",
  manaCost: "{2}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Human", "Knight"],
  power: 2,
  toughness: 2,
  keywords: ["flanking"],
  text: `Flanking (Whenever a creature without flanking blocks this creature, the blocking creature gets -1/-1 until end of turn.)\n${ETB_TEXT}`,
  triggered: [
    {
      trigger: { on: "blocked-by", who: "self", blocker: { notKeyword: "flanking" } },
      targets: [],
      effect: {
        kind: "modify-pt",
        target: "trigger-object",
        power: -1,
        toughness: -1,
        duration: "end-of-turn",
      },
      resolve: null,
      text: "Flanking",
    },
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [{ kind: "permanent", filter: { subtype: "Knight" } }],
      effect: {
        kind: "unless",
        chooser: "you",
        options: [{ pay: "{U}", text: "Pay {U}" }],
        otherwise: { kind: "destroy", target: 0, cantBeRegenerated: true },
      },
      resolve: null,
      text: ETB_TEXT,
    },
  ],
});
