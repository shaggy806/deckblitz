import { defineCard } from "../define.js";

// EDHREC rank 14716.

export default defineCard({
  name: "Imaryll, Elfhame Elite",
  manaCost: "{2}{G}{G}",
  colors: ["G"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Elf", "Warrior"],
  power: 3,
  toughness: 3,
  text: "Whenever Imaryll attacks, it gets +X/+X until end of turn, where X is the number of other Elves you control.\nYou may have Imaryll assign its combat damage as though it weren't blocked.",
  static: [
    {
      affects: { scope: "self" },
      assignAsThoughUnblocked: true,
      text: "You may have Imaryll assign its combat damage as though it weren't blocked.",
    },
  ],
  triggered: [
    {
      trigger: { on: "attacks", who: "self" },
      targets: [],
      effect: {
        kind: "modify-pt",
        target: "source",
        power: { countOf: { subtype: "Elf", controlledBy: "you" }, excludeSelf: true },
        toughness: { countOf: { subtype: "Elf", controlledBy: "you" }, excludeSelf: true },
        duration: "end-of-turn",
      },
      resolve: null,
      text: "Whenever Imaryll attacks, it gets +X/+X until end of turn, where X is the number of other Elves you control.",
    },
  ],
});
