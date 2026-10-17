import { defineCard } from "../define.js";

// EDHREC rank 8080.
//
// Rulings:
//   [2023-10-13] Adric, Mathematical Genius's first ability targets an activated or triggered
//     ability that is on the stack and creates another instance of that ability on the stack. It
//     doesn't cause any object to gain an ability.
//   [2023-10-13] Adric, Mathematical Genius can copy any activated or triggered ability on the
//     stack, not just one with targets.
//   [2023-10-13] The copy is created on the stack, so it's not "activated."
//   [2023-10-13] If the ability that's copied is modal, the copy will have the same mode.
//   [2023-10-13] The copy will resolve before the original ability does.
//   [2023-10-13] The Doctor's companion ability allows you to have two commanders if one has the
//     ability and the other is a legendary creature that is a Time Lord Doctor and has no other
//     creature types.
//
// Lithoform Engine's copy ability and Stifle's counter, the latter paid by
// sacrificing Adric; Doctor's companion is K-9, Mark I's pairing.
const COPY_TEXT =
  "{2}{U}, {T}: Copy target activated or triggered ability you control. You may choose new targets for the copy.";
const SACRIFICE_TEXT = "Ultimate Sacrifice — {1}{U}, Sacrifice Adric: Counter target activated or triggered ability.";

export default defineCard({
  name: "Adric, Mathematical Genius",
  manaCost: "{1}{U}",
  colors: ["U"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Artificer"],
  power: 1,
  toughness: 1,
  pairing: { kind: "doctors-companion" },
  text: `${COPY_TEXT}\n${SACRIFICE_TEXT}\nDoctor's companion (You can have two commanders if the other is the Doctor.)`,
  activated: [
    {
      cost: { mana: "{2}{U}", tap: true },
      targets: [{ kind: "ability", whose: "you" }],
      effect: { kind: "copy-ability", target: 0, newTargets: true },
      resolve: null,
      text: COPY_TEXT,
    },
    {
      cost: { mana: "{1}{U}", tap: false, sacrifice: "self" },
      targets: ["activated-or-triggered-ability"],
      effect: { kind: "counter", target: 0 },
      resolve: null,
      text: SACRIFICE_TEXT,
    },
  ],
});
