import { defineCard } from "../define.js";

// EDHREC rank 16312. March of the Machine.
//
// Divert Disaster's shape: the spell's controller decides whether to pay;
// if they do, the caster incubates.

export default defineCard({
  name: "Assimilate Essence",
  manaCost: "{1}{U}",
  colors: ["U"],
  types: ["instant"],
  text: 'Counter target creature or battle spell unless its controller pays {4}. If they do, you incubate 2. (Create an Incubator token with two +1/+1 counters on it and "{2}: Transform this token." It transforms into a 0/0 Phyrexian artifact creature.)',
  targets: [{ kind: "spell", filter: { typesAnyOf: ["creature", "battle"] } }],
  effect: {
    kind: "each-player-may",
    who: { controllerOfTarget: 0 },
    options: [{ pay: "{4}", text: "Pay {4}" }],
    ifDid: { kind: "incubate", amount: 2 },
    ifDidnt: { kind: "counter", target: 0 },
  },
});
