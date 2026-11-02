import { defineCard } from "../define.js";

export default defineCard({
  name: "Excise the Imperfect",
  manaCost: "{1}{W}{W}",
  colors: ["W"],
  types: ["instant"],
  text: "Exile target nonland permanent. Its controller incubates X, where X is its mana value. (They create an Incubator token with X +1/+1 counters on it and \"{2}: Transform this token.\" It transforms into a 0/0 Phyrexian artifact creature.)",
  targets: [{ kind: "permanent", whose: "any", filter: { notTypes: ["land"] } }],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "exile", target: 0 },
      {
        kind: "as-player",
        who: { controllerOfTarget: 0 },
        effect: { kind: "incubate", amount: { manaValueOf: 0 } },
      },
    ],
  },
});
