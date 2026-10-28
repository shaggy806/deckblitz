import { defineCard } from "../define.js";

// EDHREC rank 3594. Overwrite the Multiverse's shape: exile them all as one
// event, then count what was exiled this way (0 still makes an Incubator).

export default defineCard({
  name: "Sunfall",
  manaCost: "{3}{W}{W}",
  colors: ["W"],
  types: ["sorcery"],
  text: "Exile all creatures. Incubate X, where X is the number of creatures exiled this way. (Create an Incubator token with X +1/+1 counters on it and \"{2}: Transform this token.\" It transforms into a 0/0 Phyrexian artifact creature.)",
  targets: [],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "exile-all", filter: { type: "creature" } },
      { kind: "incubate", amount: { thisWay: "exiled" } },
    ],
  },
});
