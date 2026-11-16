import { defineCard } from "../define.js";

// EDHREC rank 10664.
// Cloakwood Hermit's granted end-step trigger, its intervening if (rule
// 603.4) the most damage any one source its controller controlled dealt
// this turn (`damage-dealt-this-turn` with `oneSource`, read from the
// journal): all of one source's damage, though dealt at different times and
// to different things, and only while it was theirs as it dealt it.
//
// Rulings:
//   [2022-06-10] The triggered ability granted by Dragon Cultist looks for the total amount of
//     damage dealt by a single source, even if that damage wasn't dealt all at once or wasn't
//     dealt to the same player or permanent.
//   [2022-06-10] You need to control the source that dealt damage only at the time that the
//     damage was dealt. If it dies or changes control after that point, this ability will still
//     trigger at the beginning of your end step as long as you control a commander creature with
//     the ability.
//   [2022-06-10] If you control a Background that grants an ability to commander creatures you
//     own, and you own more than one commander creature, each of them will have that ability.

const GRANTED_TEXT =
  "At the beginning of your end step, if a source you controlled dealt 5 or more damage this turn, create a 4/4 red Dragon creature token with flying.";
const TEXT = `Commander creatures you own have "${GRANTED_TEXT}"`;

export default defineCard({
  name: "Dragon Cultist",
  manaCost: "{4}{R}",
  colors: ["R"],
  supertypes: ["legendary"],
  types: ["enchantment"],
  subtypes: ["Background"],
  text: TEXT,
  static: [
    {
      affects: { scope: "filter", filter: { type: "creature", isCommander: true, ownedBy: "you" } },
      grantsTriggered: [
        {
          trigger: { on: "step-begins", step: "end", who: "you" },
          condition: { kind: "damage-dealt-this-turn", oneSource: true, atLeast: 5 },
          targets: [],
          effect: { kind: "create-token", token: "Dragon Token (Dragonback Assault)", count: 1 },
          resolve: null,
          text: GRANTED_TEXT,
        },
      ],
      text: TEXT,
    },
  ],
});
