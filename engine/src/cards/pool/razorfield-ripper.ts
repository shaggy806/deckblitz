import { defineCard } from "../define.js";
import type { ActivatedAbility } from "../../abilities.js";
import { reconfigure } from "../helpers.js";

// EDHREC rank 7653. "Pay {2} or {E}{E}{E}" is the same two abilities with
// either cost. X is read once, as the trigger resolves, after the {E} (its
// ruling); "it" is the attacking creature.
const ATTACK_TEXT =
  "Whenever this creature or equipped creature attacks, you get {E} (an energy counter), then it gets +X/+X until end of turn, where X is the amount of {E} you have.";
const RECONFIGURE_TEXT =
  "Reconfigure—Pay {2} or {E}{E}{E}. (Pay {2} or {E}{E}{E}: Attach to target creature you control; or unattach from a creature. Reconfigure only as a sorcery. While attached, this isn't a creature.)";

const withEnergy = (ability: ActivatedAbility): ActivatedAbility => ({
  ...ability,
  cost: { mana: null, tap: false, payEnergy: 3 },
  text: "Reconfigure—Pay {E}{E}{E}",
});
const byMana = reconfigure("{2}").map((a) => ({ ...a, text: "Reconfigure—Pay {2}" }));

const pump = {
  kind: "sequence",
  effects: [
    { kind: "get-energy", amount: 1 },
    {
      kind: "modify-pt",
      target: "trigger-object",
      power: { playerCounters: "energy" },
      toughness: { playerCounters: "energy" },
      duration: "end-of-turn",
    },
  ],
} as const;

export default defineCard({
  name: "Razorfield Ripper",
  manaCost: "{2}{W}",
  colors: ["W"],
  types: ["artifact", "creature"],
  subtypes: ["Equipment", "Rhino"],
  power: 3,
  toughness: 3,
  text: `${ATTACK_TEXT}\n${RECONFIGURE_TEXT}`,
  activated: [...byMana, ...byMana.map(withEnergy)],
  triggered: [
    { trigger: { on: "attacks", who: "self" }, targets: [], effect: pump, resolve: null, text: ATTACK_TEXT },
    { trigger: { on: "attacks", who: "attached" }, targets: [], effect: pump, resolve: null, text: ATTACK_TEXT },
  ],
});
