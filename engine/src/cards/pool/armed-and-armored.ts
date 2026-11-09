import { defineCard } from "../define.js";

export default defineCard({
  name: "Armed and Armored",
  manaCost: "{1}{W}",
  colors: ["W"],
  types: ["instant"],
  text: "Vehicles you control become artifact creatures until end of turn. Choose a Dwarf you control. Attach any number of Equipment you control to it.",
  effect: {
    kind: "sequence",
    effects: [
      {
        kind: "for-each-permanent",
        filter: { subtype: "Vehicle", controlledBy: "you" },
        simultaneous: true,
        effect: { kind: "become", target: 0, addTypes: ["artifact", "creature"], duration: "end-of-turn" },
      },
      {
        kind: "choose-permanents",
        filter: { type: "creature", subtype: "Dwarf", controlledBy: "you" },
        min: 1,
        upTo: 1,
        prompt: "Choose a Dwarf you control",
        then: {
          kind: "attach",
          target: 0,
          choose: {
            filter: { subtype: "Equipment", controlledBy: "you" },
            prompt: "Attach any number of Equipment you control",
          },
        },
      },
    ],
  },
});
