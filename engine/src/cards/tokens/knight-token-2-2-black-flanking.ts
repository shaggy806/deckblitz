import { defineCard } from "../define.js";

/** 2/2 black Knight with flanking, protection from white and haste —
 * Riftmarked Knight's token. */
export default defineCard({
  name: "2/2 Black Knight Token (Flanking, Protection from White, Haste)",
  art: "c31ce82f-6c4a-4986-be1e-032348504ad6",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Knight"],
  power: 2,
  toughness: 2,
  keywords: ["flanking", "haste"],
  text: "Flanking (Whenever a creature without flanking blocks this creature, the blocking creature gets -1/-1 until end of turn.)\nProtection from white\nHaste",
  static: [
    {
      affects: { scope: "self" },
      protection: { colors: ["W"] },
      text: "Protection from white",
    },
  ],
  triggered: [
    {
      trigger: { on: "blocked-by", who: "self", blocker: { notKeyword: "flanking" } },
      targets: [],
      effect: { kind: "modify-pt", target: "trigger-object", power: -1, toughness: -1, duration: "end-of-turn" },
      resolve: null,
      text: "Flanking",
    },
  ],
});
