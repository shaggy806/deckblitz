import { defineCard } from "../define.js";

// EDHREC rank 2750. Volatile Stormdrake's exchange, its target optional ("up to one"), with
// `otherwise` for "if you don't or can't make an exchange, sacrifice this creature" — no target
// chosen, the target gone or illegal, or the Drake gone (701.12a: all or nothing). The ability
// `resolvesDespiteIllegalTargets`, so a target made illegal in response still leads to the
// sacrifice rather than the ability leaving the stack (608.2b).
//
// Rulings:
//   If the chosen creature to exchange is not on the battlefield at resolution, then sacrifice
//     this card.
//   Once the ability is on the stack, adding Protection will not counter the ability but the
//     exchange will not take place since the target is illegal and you sacrifice this card on
//     resolution.

const TEXT =
  "When this creature enters, exchange control of this creature and up to one target creature an opponent controls. If you don't or can't make an exchange, sacrifice this creature. This ability still resolves if its target becomes illegal.";

export default defineCard({
  name: "Gilded Drake",
  manaCost: "{1}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Drake"],
  power: 3,
  toughness: 3,
  keywords: ["flying"],
  text: `Flying\n${TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [{ kind: "optional", of: "creature-an-opponent-controls" }],
      resolvesDespiteIllegalTargets: true,
      effect: { kind: "exchange-control", objects: ["source", 0], otherwise: { kind: "sacrifice-source" } },
      resolve: null,
      text: TEXT,
    },
  ],
});
