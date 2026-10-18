import type { TriggeredAbility } from "../../abilities.js";
import { defineCard } from "../define.js";

// EDHREC rank 18755.

const TEXT =
  "Whenever this artifact or another artifact you control enters, target creature you control gets +1/+1 and gains vigilance until end of turn.";

const TRIGGER: Omit<TriggeredAbility, "trigger"> = {
  targets: ["creature-you-control"],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "modify-pt", target: 0, power: 1, toughness: 1, duration: "end-of-turn" },
      { kind: "grant-keyword", target: 0, keyword: "vigilance", duration: "end-of-turn" },
    ],
  },
  resolve: null,
  text: TEXT,
};

export default defineCard({
  name: "Veil of Assimilation",
  manaCost: "{1}{W}",
  colors: ["W"],
  types: ["artifact"],
  text: TEXT,
  triggered: [
    { ...TRIGGER, trigger: { on: "enters-battlefield", who: "self" } },
    {
      ...TRIGGER,
      trigger: { on: "enters-battlefield", who: "you-control", filter: { type: "artifact" }, otherOnly: true },
    },
  ],
});
