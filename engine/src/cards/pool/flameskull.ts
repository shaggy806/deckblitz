import { defineCard } from "../define.js";

// EDHREC rank 22226. Hofri Ghostforge's "exile it. If you do" (a `this-way`
// exiled condition), then the top card exiled, then Kotose's one `grant-play`
// over every card exiled this way with `upTo: 1`: Flameskull and the top card
// share one play (a `GameState.permissionGroups` entry), so playing either
// leaves the other in exile for good (the reminder text).

const REJUVENATION =
  "Rejuvenation — When this creature dies, exile it. If you do, exile the top card of your library. Until the end of your next turn, you may play one of those cards. (If you cast Flameskull this way, you can't play the other card, and vice versa.)";

export default defineCard({
  name: "Flameskull",
  manaCost: "{1}{R}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Skeleton"],
  power: 3,
  toughness: 1,
  text: "Flying\nThis creature can't block.\n" + REJUVENATION,
  keywords: ["flying"],
  static: [{ affects: { scope: "self" }, restrictions: ["cant-block"], text: "This creature can't block." }],
  triggered: [
    {
      trigger: { on: "dies", who: "self" },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "exile", target: "trigger-object" },
          {
            kind: "conditional",
            condition: { kind: "this-way", what: "exiled" },
            then: {
              kind: "sequence",
              effects: [
                { kind: "exile-from-library", amount: 1 },
                {
                  kind: "grant-play",
                  cards: { thisWay: "exiled" },
                  duration: "until-end-of-your-next-turn",
                  play: true,
                  upTo: 1,
                },
              ],
            },
          },
        ],
      },
      resolve: null,
      text: REJUVENATION,
    },
  ],
});
