import { defineCard } from "../define.js";

// Kaldheim (KHM). EDHREC rank 9146.
//
// "If this spell was foretold": cast for its foretell cost from exile (`castVia: "foretell"`),
// where X is chosen as part of {X}{X}{W} (its ruling: {2}{W} for one token, {4}{W} for two, …).
export default defineCard({
  name: "Starnheim Unleashed",
  manaCost: "{2}{W}{W}",
  colors: ["W"],
  types: ["sorcery"],
  text: "Create a 4/4 white Angel Warrior creature token with flying and vigilance. If this spell was foretold, create X of those tokens instead.\nForetell {X}{X}{W} (During your turn, you may pay {2} and exile this card from your hand face down. Cast it on a later turn for its foretell cost.)",
  foretell: { cost: "{X}{X}{W}" },
  targets: [],
  effect: {
    kind: "conditional",
    condition: { kind: "source", filter: { castVia: "foretell" } },
    then: { kind: "create-token", token: "Angel Warrior Token (Flying, Vigilance)", count: "x" },
    else: { kind: "create-token", token: "Angel Warrior Token (Flying, Vigilance)", count: 1 },
  },
});
