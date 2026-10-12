import { defineCard } from "../define.js";

// EDHREC rank 8904.
//
// "You may behold a Dragon" is an optional additional cost (rule 601.2b), a
// kicker by another name: "if a Dragon was beheld" (701.4b) is the kicked
// cast, offered only with a Dragon to behold, whose tax is {4} instead of
// {2}. Whatever becomes of the Dragon after, it was beheld (the ruling).

export default defineCard({
  name: "Dispelling Exhale",
  manaCost: "{1}{U}",
  colors: ["U"],
  types: ["instant"],
  text: "As an additional cost to cast this spell, you may behold a Dragon. (You may choose a Dragon you control or reveal a Dragon card from your hand.)\nCounter target spell unless its controller pays {2}. If a Dragon was beheld, counter that spell unless its controller pays {4} instead.",
  kicker: {
    cost: "",
    keyword: "behold",
    behold: { filter: { subtype: "Dragon" }, text: "a Dragon" },
    effect: {
      kind: "unless",
      chooser: 0,
      options: [{ pay: "{4}", text: "Pay {4}" }],
      otherwise: { kind: "counter", target: 0 },
    },
  },
  targets: ["spell"],
  effect: {
    kind: "unless",
    chooser: 0,
    options: [{ pay: "{2}", text: "Pay {2}" }],
    otherwise: { kind: "counter", target: 0 },
  },
});
