/**
 * `commander-rules`: Learn Commander's second game (`docs/plans/tutorials.md`,
 * section 3), Commander's own rules, for someone who has played the first. It
 * joins a three-player game on turn 9 and plays it out to turn 15: whom to
 * attack, a commander dying and coming back for {2} more (rules 903.9a, 903.8),
 * an instant and the stack (405.5, 608.2b), and commander damage (903.10a).
 *
 * The same deck as the first game, whose 7-power commander makes 21 three hits.
 * The damage is exact:
 *
 * - Turn 9: Kalakscion hits Rowan (30 to 23, commander damage 7 to 14); Cabal
 *   Evangel and Muck Rats hit Mira (9 to 6).
 * - Turn 10: Rowan's Shock kills Kalakscion, which goes back to the command zone.
 * - Turn 11: Mira's Grizzly Bears attack and she casts Giant Growth; Disfigure in
 *   response kills them. Your creatures attacked, so no block is asked for.
 * - Turn 12: Kalakscion is cast for 5; the Evangel and the Rats hit Mira (to 3).
 * - Turn 15: Kalakscion hits Rowan, 21 commander damage with 16 life left, and
 *   the Evangel and the Rats finish Mira.
 */

import { asPlayerId } from "engine/local";
import type { ScenarioCard } from "protocol";
import type { TutorialCondition } from "./conditions.js";
import type { Lesson, LessonStep } from "./lesson.js";

const YOU = asPlayerId("alice");
const ROWAN = asPlayerId("bob");
const MIRA = asPlayerId("carol");

const COMMANDER = "Kalakscion, Hunger Tyrant";
const EVANGEL = "Cabal Evangel";
const RATS = "Muck Rats";
const INSTANT = "Disfigure";
const BEARS = "Grizzly Bears";
const GROWTH = "Giant Growth";
const SHOCK = "Shock";

const named = (n: number, name: string, owner: typeof YOU, zone: ScenarioCard["zone"], key: string): ScenarioCard[] =>
  Array.from({ length: n }, (_, i): ScenarioCard => ({ key: `${key}-${i + 1}`, name, owner, zone }));

const cards: ScenarioCard[] = [
  { key: "commander", name: COMMANDER, owner: YOU, zone: "battlefield", commander: true, casts: 1, commanderDamage: { [ROWAN]: 7 } },
  { key: "evangel", name: EVANGEL, owner: YOU, zone: "battlefield" },
  { key: "rats", name: RATS, owner: YOU, zone: "battlefield" },
  ...named(5, "Swamp", YOU, "battlefield", "swamp"),
  { key: "instant", name: INSTANT, owner: YOU, zone: "hand" },
  { key: "vampire", name: "Barony Vampire", owner: YOU, zone: "hand" },
  { key: "pangolin", name: "Gloom Pangolin", owner: YOU, zone: "hand" },
  // Every draw is listed, so nobody's filler is the wrong colour.
  ...named(3, "Swamp", YOU, "library", "your-draw"),
  { key: "tyrox", name: "Tyrox, Saurid Tyrant", owner: ROWAN, zone: "command", commander: true },
  ...named(4, "Mountain", ROWAN, "battlefield", "mountain"),
  { key: "shock", name: SHOCK, owner: ROWAN, zone: "hand" },
  { key: "guard", name: "Capital Guard", owner: ROWAN, zone: "hand" },
  ...named(2, "Mountain", ROWAN, "library", "rowan-draw"),
  { key: "marwyn", name: "Marwyn, the Nurturer", owner: MIRA, zone: "command", commander: true },
  ...named(4, "Forest", MIRA, "battlefield", "forest"),
  { key: "bears", name: BEARS, owner: MIRA, zone: "battlefield" },
  { key: "growth", name: GROWTH, owner: MIRA, zone: "hand" },
  { key: "elves", name: "Llanowar Elves", owner: MIRA, zone: "hand" },
  ...named(2, "Forest", MIRA, "library", "mira-draw"),
];

const mainOf = (player: typeof YOU): TutorialCondition => ({ event: "step-began", step: "precombat-main", player });

const toCombat = (id: string, title: string, body: string): LessonStep => ({
  id,
  title,
  body,
  anchor: "tour:game-pass",
  placement: "top",
  holdPriority: true,
  allow: [{ do: "pass" }],
  goals: [{ id: `${id}-done`, label: "Press Pass", when: { event: "step-began", step: "begin-combat", player: YOU } }],
});

/** Everyone in `at`, in the order they sit on the board, attacks whom it names.
 * The card sits beside the last of them, clear of the creatures to click and the
 * two boards to click them at. */
const attack = (id: string, at: Readonly<Record<string, typeof YOU>>, label: string, title: string, body: string): LessonStep => {
  const attackers = Object.keys(at);
  return {
    id,
    title,
    body,
    anchor: `card:${attackers[attackers.length - 1]}`,
    placement: "right",
    allow: [{ do: "attack", card: attackers, atLeast: attackers.length, at }],
    goals: [{ id: `${id}-done`, label, when: { event: "attackers-declared", player: YOU, atLeast: attackers.length } }],
  };
};

const passTurn = (id: string, title: string, body: string, opensOn: TutorialCondition): LessonStep => ({
  id,
  title,
  body,
  anchor: "tour:game-pass-turn",
  placement: "top",
  holdPriority: true,
  opensOn,
  allow: [{ do: "pass-turn" }],
  goals: [{ id: `${id}-done`, label: "Press Pass Turn", when: { event: "turn-began", player: ROWAN } }],
});

export const COMMANDER_RULES: Lesson = {
  id: "commander-rules",
  title: "Commander's rules",
  scripted: true,
  chapters: [
    {
      id: "bigger-table",
      title: "A bigger table",
      board: {
        spec: {
          seats: [
            { player: YOU, life: 31, bot: false },
            { player: ROWAN, life: 30, bot: true },
            { player: MIRA, life: 9, bot: true },
          ],
          cards,
          active: YOU,
          step: "precombat-main",
          turn: 9,
          libraryFill: 20,
        },
        opponents: {
          bob: {
            name: "Rowan",
            script: { moves: [{ do: "cast", card: SHOCK, target: COMMANDER, on: { turn: 10 } }], otherwise: "pass" },
          },
          carol: {
            name: "Mira",
            script: {
              moves: [
                { do: "attack", card: BEARS, at: "alice", on: { turn: 11 } },
                { do: "cast", card: GROWTH, target: BEARS, on: { turn: 11, step: "declare-blockers" } },
              ],
              otherwise: "pass",
            },
          },
        },
      },
      steps: [
        {
          id: "welcome",
          title: "A game already going",
          body:
            "Commander is usually played by three or four, so we've joined a game partway through. You know the moves. This time it's what makes Commander different.\n\n" +
            "It's your turn, with the same creatures as last time.",
        },
        {
          id: "everyone-for-themselves",
          title: "Everyone for themselves",
          body: "This is Mira, your other opponent. She's in trouble on 9 life. Turns go round the table, and a player who loses leaves the game while the others play on.",
          anchor: "player:carol",
          placement: "bottom",
        },
        {
          id: "damage-chip",
          title: "Commander damage",
          body:
            "This chip shows that your commander has already hit Rowan for 7. It only counts combat damage from one commander, and it never heals.\n\n" +
            "At 21, that player is out, however much life they have. Rowan has plenty of life, but your commander only needs two more hits.",
          anchor: "tour:game-commander-damage",
          placement: "bottom",
        },
      ],
    },
    {
      id: "whom-to-attack",
      title: "Whom to attack",
      steps: [
        toCombat("first-to-combat", "On to combat", "Press Pass to go to combat, as you did last game."),
        attack(
          "first-attack",
          { [COMMANDER]: ROWAN, [EVANGEL]: MIRA, [RATS]: MIRA },
          "Attack as the card says",
          "Choose whom each one attacks",
          "With two opponents, each attacker needs a target. Click Kalakscion, then click anywhere on Rowan's side of the table. " +
            "Do the same for your Evangel and your Rats, sending both at Mira, then press Attack with 3.",
        ),
        {
          id: "first-hit",
          title: "14 from your commander",
          body: "Rowan took 7, off their life and onto that chip, which now says 14. Mira took 3 and is down to 6.",
          anchor: "tour:game-commander-damage",
          placement: "bottom",
          opensOn: { event: "combat-damage" },
        },
        passTurn("first-pass", "Over to Rowan", "Attacking has tapped all your creatures, so they can't block this time round. Press Pass Turn.", {
          lifeAtMost: { player: MIRA, value: 6 },
        }),
      ],
    },
    {
      id: "commander-dies",
      title: "When a commander dies",
      opensOn: { event: "spell-cast", player: ROWAN, card: SHOCK },
      steps: [
        {
          id: "shocked",
          title: "Rowan strikes back",
          body: "Rowan casts Shock at your commander. It deals 2 damage, and your commander's toughness is only 2. A big attacker with low toughness is easy to destroy.",
          anchor: `card:${COMMANDER}`,
          placement: "right",
        },
        {
          id: "back-to-command-zone",
          title: "Send it back",
          body: "Your commander has been destroyed, but you get a choice: leave it in the graveyard, or put it back in the command zone. Press Command zone, so you can cast it again.",
          opensOn: { event: "spell-resolved", card: SHOCK },
          allow: [],
          goals: [{ id: "commander-back", label: "Press Command zone", when: { event: "commander-to-command-zone" } }],
        },
        {
          id: "commander-tax",
          title: "It costs more now",
          body:
            "Each time you cast a commander from the command zone, it costs {2} more than the last time. That's the +2 beside its cost, which makes it 5 mana now. The extra is called commander tax.\n\n" +
            "The damage it has dealt stays on the chip, so Rowan is still on 14.",
          anchor: `card:${COMMANDER}`,
          placement: "left",
        },
      ],
    },
    {
      id: "stack",
      title: "Instants and the stack",
      opensOn: { event: "spell-cast", player: MIRA, card: GROWTH },
      steps: [
        {
          id: "on-the-stack",
          title: "Wait for it",
          body:
            "Mira attacked you with her Bears, then cast Giant Growth to make them 5/5. But a spell doesn't happen as soon as it's cast. " +
            "It waits on the stack, and every player gets a chance to respond first.",
          anchor: `card:${GROWTH}`,
          placement: "right",
        },
        {
          id: "respond",
          title: "Respond with an instant",
          body:
            "An instant can be cast at any time you have the mana, even on someone else's turn. Disfigure gives a creature -2/-2, and the Bears are still only 2/2. " +
            "Click Disfigure in your hand, then click the Bears.",
          anchor: `card:${INSTANT}`,
          placement: "top",
          showHand: true,
          allow: [{ do: "cast", card: INSTANT, target: BEARS }],
          goals: [{ id: "responded", label: "Cast Disfigure on the Bears", when: { event: "spell-resolved", card: INSTANT } }],
        },
        {
          id: "last-in-first-out",
          title: "Last in, first out",
          body:
            "The newest spell on the stack resolves first, so Disfigure went before Giant Growth and destroyed the Bears. With its target gone, Giant Growth does nothing.\n\n" +
            "If you'd waited, the Bears would have been 5/5 and Disfigure couldn't have stopped them.",
          anchor: `card:${GROWTH}`,
          placement: "right",
        },
      ],
    },
    {
      id: "again",
      title: "Back again",
      opensOn: mainOf(YOU),
      steps: [
        {
          id: "recast",
          title: "Cast it again",
          body: "You have five Swamps, which is just enough for your commander with its tax. Click it in the command zone.",
          anchor: `card:${COMMANDER}`,
          placement: "left",
          allow: [{ do: "cast", card: COMMANDER }],
          goals: [{ id: "recast-done", label: `Cast ${COMMANDER}`, when: { event: "spell-resolved", card: COMMANDER } }],
        },
        toCombat("second-to-combat", "Combat", "It's only just arrived, so your commander has to wait. Your other two creatures can go. Press Pass."),
        attack(
          "second-attack",
          { [EVANGEL]: MIRA, [RATS]: MIRA },
          "Attack Mira with both",
          "Finish what you started",
          "Mira has no creatures left to block with. Send your Evangel and your Rats at her, then press Attack with 2.",
        ),
        passTurn("second-pass", "Mira is on 3", "One more attack like that will do it. Press Pass Turn, and we'll skip ahead to your next turn.", {
          lifeAtMost: { player: MIRA, value: 3 },
        }),
      ],
    },
    {
      id: "both-at-once",
      title: "Both at once",
      opensOn: mainOf(YOU),
      steps: [
        {
          id: "the-sums",
          title: "Add it up",
          body: "Rowan still has 23 life, far more than your commander's 7 power. But the chip says 14, and 14 and 7 make 21. Mira has 3 life, and your other two creatures have 3 power.",
          anchor: "tour:game-commander-damage",
          placement: "bottom",
        },
        toCombat("last-to-combat", "To combat", "Press Pass."),
        attack(
          "last-attack",
          // In board order: having come back, the commander is now the last.
          { [EVANGEL]: MIRA, [RATS]: MIRA, [COMMANDER]: ROWAN },
          "Attack as the card says",
          "Everyone at once",
          "Send your commander at Rowan, and your Evangel and your Rats at Mira, then press Attack with 3.",
        ),
        {
          id: "won",
          title: "You won!",
          body: "Mira ran out of life. Rowan still had plenty, but 21 combat damage from one commander knocked them out all the same. That's Commander.",
          opensOn: { event: "player-lost", player: ROWAN },
        },
      ],
    },
  ],
};
