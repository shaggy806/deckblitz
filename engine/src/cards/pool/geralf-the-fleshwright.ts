import { defineCard } from "../define.js";

// EDHREC rank 6953.
//
// Rulings:
//   [2024-04-12] Geralf’s first ability will consider spells you cast before it was on the
//     battlefield. For example, if Geralf is the first spell you cast during your turn, each
//     subsequent spell you cast that turn after it’s on the battlefield will cause its first
//     ability to trigger.
//   [2024-04-12] If multiple Zombies enter the battlefield under your control at the same time,
//     Geralf’s last ability will trigger for each of those Zombies. Each of those triggered
//     abilities will see each of those other Zombies that entered the battlefield plus any other
//     Zombies that entered the battlefield under your control so far this turn.
//
// "During your turn other than your first spell that turn" is part of the
// trigger condition (a `whileCondition`, not an intervening if): your turn,
// and you've cast two or more spells this turn counting this one — the
// count holds the spells cast before Geralf arrived (the first ruling).
//
// The counters count every Zombie that entered under your control this turn
// (`turnHistory: "entered"`, a token stack as each token in it — so Zombies
// entering together each see the others, the second ruling), less the one
// this trigger is about whenever it's still a Zombie to be counted.
const CAST_TEXT =
  "Whenever you cast a spell during your turn other than your first spell that turn, create a 2/2 blue and black Zombie Rogue creature token.";
const ZOMBIE_TEXT =
  "Whenever a Zombie you control enters, put a +1/+1 counter on it for each other Zombie that entered the battlefield under your control this turn.";

const ZOMBIES_ENTERED = { turnHistory: "entered", who: "you", filter: { subtype: "Zombie" } } as const;

export default defineCard({
  name: "Geralf, the Fleshwright",
  manaCost: "{2}{U}",
  colors: ["U"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Warlock"],
  power: 2,
  toughness: 3,
  text: `${CAST_TEXT}\n${ZOMBIE_TEXT}`,
  triggered: [
    {
      trigger: { on: "cast-spell", who: "you" },
      whileCondition: {
        kind: "all",
        of: [{ kind: "your-turn" }, { kind: "turn-stat", stat: "spells-cast", who: "you", atLeast: 2 }],
      },
      targets: [],
      effect: { kind: "create-token", token: "Zombie Rogue Token", count: 1 },
      resolve: null,
      text: CAST_TEXT,
    },
    {
      trigger: { on: "enters-battlefield", who: "you-control", filter: { subtype: "Zombie" } },
      targets: [],
      effect: {
        kind: "conditional",
        condition: { kind: "trigger-object", filter: { subtype: "Zombie" } },
        then: {
          kind: "add-counter",
          target: "trigger-object",
          counter: "+1/+1",
          amount: { difference: [ZOMBIES_ENTERED, 1] },
        },
        else: { kind: "add-counter", target: "trigger-object", counter: "+1/+1", amount: ZOMBIES_ENTERED },
      },
      resolve: null,
      text: ZOMBIE_TEXT,
    },
  ],
});
