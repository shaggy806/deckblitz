import { defineCard } from "../define.js";

// EDHREC rank 10080. The targets are chosen at every beginning of combat; the
// choice to give the permanent away is made as the ability resolves (the
// ruling). Zedruu's donate does the giving. If either target has become
// illegal, nothing is given and there's no token (the ruling): an illegal
// slot is blank, so the reflexive trigger is set up only when the permanent
// is under an opponent's control after the gift — which, from a permanent
// you controlled, is the gift having happened. The counters are counted as
// the reflexive trigger resolves, the given permanent among them.
const ENTER_TEXT = "When Iroh enters, create a Food token.";
const COMBAT_TEXT =
  "At the beginning of combat on your turn, you may have target opponent gain control of target permanent you control. When you do, create a 1/1 white Ally creature token. Put a +1/+1 counter on that token for each permanent you own that your opponents control.";

export default defineCard({
  name: "Iroh, Tea Master",
  manaCost: "{1}{R}{W}",
  colors: ["W", "R"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Citizen", "Ally"],
  power: 2,
  toughness: 2,
  text: `${ENTER_TEXT}\n${COMBAT_TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: { kind: "create-token", token: "Food Token", count: 1 },
      resolve: null,
      text: ENTER_TEXT,
    },
    {
      trigger: { on: "step-begins", step: "begin-combat", who: "you" },
      targets: ["opponent", { kind: "permanent", whose: "you", filter: {} }],
      effect: {
        kind: "conditional",
        condition: { kind: "target", index: 1, filter: { controlledBy: "you" } },
        then: {
          kind: "may",
          prompt: "Have target opponent gain control of target permanent you control?",
          effect: {
            kind: "sequence",
            effects: [
              { kind: "gain-control", target: 1, who: { target: 0 }, untilEndOfTurn: false },
              {
                kind: "conditional",
                condition: { kind: "target", index: 1, filter: { controlledBy: "opponent" } },
                then: {
                  kind: "reflexive-trigger",
                  targets: [],
                  effect: {
                    kind: "create-token",
                    token: "Ally Token",
                    count: 1,
                    thenCounters: {
                      kind: "+1/+1",
                      amount: { countOf: { ownedBy: "you", controlledBy: "opponent" } },
                    },
                  },
                  text: "When you do, create a 1/1 white Ally creature token. Put a +1/+1 counter on that token for each permanent you own that your opponents control.",
                },
              },
            ],
          },
        },
      },
      resolve: null,
      text: COMBAT_TEXT,
    },
  ],
});
