import { defineCard } from "../define.js";

const ECHO =
  "{5}: This land becomes a copy of target creature you control until end of turn. The \"legend rule\" doesn't apply to permanents you control this turn.";

// The legend rule's exemption is a timed static: Mirror Gallery's
// `legendRuleOff` for this turn over permanents you control, reaching those
// that come later too (rule 611.2c — a rule change, not a characteristic).
export default defineCard({
  name: "Hall of Echoes",
  colors: [],
  types: ["land"],
  text: `{T}: Add {C}.\n${ECHO}`,
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: [],
      effect: { kind: "add-mana", mana: "C", amount: 1 },
      resolve: null,
      text: "{T}: Add {C}.",
    },
    {
      cost: { mana: "{5}", tap: false },
      targets: ["creature-you-control"],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "become-copy", target: "source", of: 0, until: "end-of-turn" },
          {
            kind: "timed-static",
            duration: "end-of-turn",
            static: [
              {
                affects: { scope: "filter", filter: { controlledBy: "you" } },
                legendRuleOff: true,
                text: "The \"legend rule\" doesn't apply to permanents you control this turn.",
              },
            ],
            text: "The \"legend rule\" doesn't apply to permanents you control this turn.",
          },
        ],
      },
      resolve: null,
      text: ECHO,
    },
  ],
});
