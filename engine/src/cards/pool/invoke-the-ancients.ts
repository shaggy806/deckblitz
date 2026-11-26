import { defineCard } from "../define.js";

// EDHREC rank 20794. Kamigawa: Neon Dynasty.
//
// "For each of them" is a `for-each-permanent` over the tokens this
// resolution made (`thisWay: "created"`), each its own turn, so the counter is
// chosen token by token (a `modal` per token, slot 0 the token) — every token
// a replacement made too (the first ruling: Parallel Lives makes four, four
// choices).
//
// Rulings:
//   [2022-02-18] If a replacement effect causes you to create more than two tokens, you will make
//     that choice for each of those tokens individually. For example, if you resolve Invoke the
//     Ancients while you control Parallel Lives, you will choose a type of counter for each of the
//     four resulting tokens.
//   [2022-02-18] You choose the type of counter that each of the two green Spirit creature tokens
//     will get separately.

const counterOn = (counter: string, text: string) =>
  ({ text, effect: { kind: "add-counter", target: 0, counter, amount: 1 } }) as const;

export default defineCard({
  name: "Invoke the Ancients",
  manaCost: "{1}{G}{G}{G}{G}",
  colors: ["G"],
  types: ["sorcery"],
  text:
    "Create two 4/5 green Spirit creature tokens. For each of them, put your choice of a reach counter, " +
    "a vigilance counter, or a trample counter on it.",
  effect: {
    kind: "sequence",
    effects: [
      { kind: "create-token", token: "Spirit Token (Green 4/5)", count: 2 },
      {
        kind: "for-each-permanent",
        filter: { thisWay: "created" },
        effect: {
          kind: "modal",
          minModes: 1,
          maxModes: 1,
          modes: [
            counterOn("reach", "A reach counter"),
            counterOn("vigilance", "A vigilance counter"),
            counterOn("trample", "A trample counter"),
          ],
        },
      },
    ],
  },
});
