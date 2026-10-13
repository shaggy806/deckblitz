import { defineCard } from "../define.js";
import type { TriggeredAbility } from "../../abilities.js";

// EDHREC rank 7027.
//
// Rulings:
//   [2016-11-08] An ability of an Equipment that triggers "whenever equipped creature attacks"
//     triggers only if the Equipment was attached to a creature at the moment that creature was
//     declared as an attacker, and any references to "that creature" in the effect refer to the
//     creature the Equipment was attached to when the ability triggered.
//   [2016-11-08] If an Equipment an opponent controls is attached to a creature you control, any
//     ability of that Equipment that says "you" refers to that opponent. However, if the Equipment
//     says that the equipped creature has an ability, the word "you" in that ability refers to
//     you, the controller of the creature.
//   [2016-11-08] You can choose to target no Equipment if you don't want to attach any to Armory
//     Automaton. Because the ability is optional, you also don't have to attach the Equipment it
//     targets as you resolve the ability. However, you must either attach all of the target
//     Equipment or attach none of them.
//   [2016-11-08] The triggered ability triggers both when Armory Automaton enters the battlefield
//     and whenever it attacks. You don't have to choose only one.
//   [2016-11-08] Armory Automaton's ability can cause an Equipment one player controls to become
//     attached to a creature another player controls. The controller of the Equipment can pay the
//     equip cost to attach that Equipment to a creature they control, but only any time that
//     player could cast a sorcery. The controller of Armory Automaton can't activate equip
//     abilities of Equipment they don't control.
//   [2016-11-08] If Armory Automaton leaves the battlefield before its ability resolves, nothing
//     happens to any of the Equipment it targeted. If they were already attached to other
//     creatures, they remain attached to those creatures.

const TEXT =
  "Whenever this creature enters or attacks, you may attach any number of target Equipment to it. (Control of the Equipment doesn't change.)";

// "Enters or attacks" is two triggers, each the same ability: any number of
// target Equipment, anyone's (the fifth ruling), all attached or none — the
// one "may" is asked once (the third ruling). Each is attached only while the
// Automaton is still the object it was: gone before this resolves, nothing
// moves (the last ruling).
const attachEquipment = (trigger: TriggeredAbility["trigger"]): TriggeredAbility => ({
  trigger,
  targets: [{ kind: "any-number", of: { kind: "permanent", whose: "any", filter: { subtype: "Equipment" } } }],
  effect: {
    kind: "may",
    prompt: "Attach the target Equipment to this creature?",
    effect: { kind: "for-each-target", from: 0, effect: { kind: "attach", target: "source", attachment: 0 } },
  },
  resolve: null,
  text: TEXT,
});

export default defineCard({
  name: "Armory Automaton",
  manaCost: "{3}",
  colors: [],
  types: ["artifact", "creature"],
  subtypes: ["Construct"],
  power: 2,
  toughness: 2,
  text: TEXT,
  triggered: [
    attachEquipment({ on: "enters-battlefield", who: "self" }),
    attachEquipment({ on: "attacks", who: "self" }),
  ],
});
