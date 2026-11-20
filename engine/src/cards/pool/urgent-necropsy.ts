import { defineCard } from "../define.js";

// EDHREC rank 18881.
//
// The evidence is the total mana value of the permanents it targets, each
// counted once (an artifact creature chosen as two of them is one permanent),
// fixed as the targets are and paid once the spell is on the stack (rules
// 601.2c, 601.2h, 701.59a). With no target, X is 0. Only targets whose total
// the graveyard can cover are castable together (701.59b).
const upToOne = (type: "artifact" | "creature" | "enchantment" | "planeswalker") =>
  ({ kind: "optional", of: { kind: "permanent", filter: { type } } }) as const;

export default defineCard({
  name: "Urgent Necropsy",
  manaCost: "{2}{B}{G}",
  colors: ["B", "G"],
  types: ["instant"],
  additionalCost: { collectEvidenceTargetsManaValue: true },
  text: "As an additional cost to cast this spell, collect evidence X, where X is the total mana value of the permanents this spell targets.\nDestroy up to one target artifact, up to one target creature, up to one target enchantment, and up to one target planeswalker.",
  targets: [upToOne("artifact"), upToOne("creature"), upToOne("enchantment"), upToOne("planeswalker")],
  effect: {
    kind: "sequence",
    simultaneous: true,
    effects: [
      { kind: "destroy", target: 0 },
      { kind: "destroy", target: 1 },
      { kind: "destroy", target: 2 },
      { kind: "destroy", target: 3 },
    ],
  },
});
