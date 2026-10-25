import type { ActivatedAbility } from "../../abilities.js";
import { defineCard } from "../define.js";

const FIGHT_TEXT = "{T}: This creature fights another target creature.";
const FIGHT: ActivatedAbility = {
  cost: { mana: null, tap: true },
  targets: [{ kind: "other", of: "creature" }],
  effect: { kind: "fight", a: "source", b: 0 },
  resolve: null,
  text: FIGHT_TEXT,
};

export default defineCard({
  name: "Setessan Tactics",
  manaCost: "{1}{G}",
  colors: ["G"],
  types: ["instant"],
  text: `Strive — This spell costs {G} more to cast for each target beyond the first.\nUntil end of turn, any number of target creatures each get +1/+1 and gain "${FIGHT_TEXT}"`,
  costPerExtraTarget: "{G}",
  targets: [{ kind: "any-number", of: "creature" }],
  effect: {
    kind: "for-each-target",
    from: 0,
    effect: {
      kind: "sequence",
      effects: [
        { kind: "modify-pt", target: 0, power: 1, toughness: 1, duration: "end-of-turn" },
        { kind: "grant-activated", target: 0, ability: FIGHT, duration: "end-of-turn" },
      ],
    },
  },
});
