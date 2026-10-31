/** Attack requirements narrowed (rule 508.1d) — the `attack-requirement`
 * effect's `target`, `controlledByTarget`, `attacks` and `duration`: Alluring
 * Siren, Taunt, Dulcet Sirens, Trench Behemoth and Imaginary Threats. */
import { describe, expect, it } from "vitest";

import type { LegalAction } from "../actions.js";
import type { Game } from "../game.js";
import type { ObjectId, PlayerId } from "../primitives.js";
import { activePlayerOf } from "../state.js";
import type { GameState } from "../state.js";
import { A, B, C, activate, cast, enter, lands, ref, spawn, table, toHand } from "./harness.js";

type AttackOffer = Extract<LegalAction, { kind: "declare-attackers" }>;

/** `who` holds priority in `step` of `turnOf`'s next turn (this one if it's
 * theirs and the step is still to come), the stack empty. */
function toPriority(game: Game, turnOf: PlayerId, step: GameState["turn"]["step"], who: PlayerId): void {
  game.advanceUntil(
    (s) =>
      activePlayerOf(s) === turnOf &&
      s.turn.step === step &&
      s.priority.holder === who &&
      s.awaiting === null &&
      s.zones.shared.stack.length === 0,
  );
}

/** What `player` is offered as they declare attackers next. */
function attackOffer(game: Game, player: PlayerId): AttackOffer {
  game.advanceUntil((s) => s.awaiting?.kind === "attackers" && s.awaiting.player === player);
  const offer = game.legalActions(player).find((o): o is AttackOffer => o.kind === "declare-attackers");
  if (offer === undefined) throw new Error(`${player} wasn't asked to attack`);
  return offer;
}

/** Declare no attackers bar the required ones, sent where they must go —
 * the scripted seat's default — and run to the end of that turn. */
function finishTurn(game: Game): void {
  const turn = game.state.turn.number;
  game.advanceUntil((s) => s.turn.number > turn);
}

describe("target creature attacks you this turn if able (Alluring Siren)", () => {
  it("binds that creature to attack you, and only this turn", () => {
    const { game } = table({ players: 3 });
    const siren = spawn(game, "Alluring Siren");
    const bears = spawn(game, "Grizzly Bears", B);
    const other = spawn(game, "Grizzly Bears", B);
    toPriority(game, B, "begin-combat", A);
    activate(game, siren, 0, { player: A, targets: [ref(bears)] });
    const offer = attackOffer(game, B);
    expect(offer.mustAttack).toEqual([bears]);
    // Aimed at alice: attacking carol would obey none of its requirements.
    expect(offer.defendersFor[bears]).toEqual([A]);
    expect(offer.defendersFor[other]).toEqual(expect.arrayContaining([A, C]));
    finishTurn(game);
    expect(game.state.attackRequirements ?? []).toEqual([]);
  });

  it("binds nothing once the creature can't attack you", () => {
    const { game } = table({ players: 3 });
    const siren = spawn(game, "Alluring Siren");
    const bears = spawn(game, "Grizzly Bears", B);
    toPriority(game, B, "begin-combat", A);
    activate(game, siren, 0, { player: A, targets: [ref(bears)] });
    game.state.objects[bears].tapped = true;
    const offer = attackOffer(game, B);
    expect(offer.mustAttack).toEqual([]);
  });

  it("doesn't bind the creature once it has left and come back (rule 400.7)", () => {
    const { game } = table({ players: 3 });
    const siren = spawn(game, "Alluring Siren");
    const bears = spawn(game, "Grizzly Bears", B);
    toPriority(game, B, "begin-combat", A);
    activate(game, siren, 0, { player: A, targets: [ref(bears)] });
    game.state.objects[bears].zoneChangeCount = (game.state.objects[bears].zoneChangeCount ?? 0) + 2;
    expect(attackOffer(game, B).mustAttack).toEqual([]);
  });
});

describe("during target player's next turn, creatures that player controls attack you (Taunt)", () => {
  it("binds that player's creatures during their next turn only", () => {
    const { game } = table({ players: 3 });
    lands(game, "Island", 1);
    const bears = spawn(game, "Grizzly Bears", B);
    const carols = spawn(game, "Grizzly Bears", C);
    const taunt = toHand(game, "Taunt");
    cast(game, taunt, { targets: [ref(B)] });
    // A creature they get later is bound too.
    const later = spawn(game, "Grizzly Bears", B);
    const offer = attackOffer(game, B);
    expect([...offer.mustAttack].sort()).toEqual([bears, later].sort());
    expect(offer.defendersFor[bears]).toEqual([A]);
    finishTurn(game);
    expect(attackOffer(game, C).mustAttack).toEqual([]);
    void carols;
    finishTurn(game);
    finishTurn(game);
    // Bob's turn after that one: over.
    expect(attackOffer(game, B).mustAttack).toEqual([]);
  });

  it("cast on that player's own turn, waits for their next one", () => {
    const { game } = table({ players: 2 });
    const bears = spawn(game, "Grizzly Bears", B);
    toPriority(game, B, "upkeep", A);
    // A sorcery can't be cast on bob's turn: Taunt's rule, put there by hand.
    game.state.attackRequirements = [
      {
        by: A,
        filter: { type: "creature" },
        otherThanYou: false,
        controlledBy: B,
        attacks: A,
        duration: { kind: "next-turn-of", player: B, after: game.state.turn.number },
      },
    ];
    expect(attackOffer(game, B).mustAttack).toEqual([]);
    finishTurn(game);
    expect(attackOffer(game, B).mustAttack).toEqual([bears]);
  });
});

describe("target creature attacks target opponent this turn if able (Dulcet Sirens)", () => {
  it("sends it at that opponent", () => {
    const { game } = table({ players: 3 });
    const sirens = spawn(game, "Dulcet Sirens");
    lands(game, "Island", 1);
    const bears = spawn(game, "Grizzly Bears", B);
    toPriority(game, B, "begin-combat", A);
    activate(game, sirens, 0, { player: A, targets: [ref(bears), ref(C)] });
    const offer = attackOffer(game, B);
    expect(offer.mustAttack).toEqual([bears]);
    expect(offer.defendersFor[bears]).toEqual([C]);
  });
});

describe("target creature attacks during its controller's next combat phase (Trench Behemoth)", () => {
  it("binds it in that player's next combat, then ends", () => {
    const { game, a } = table({ players: 2 });
    spawn(game, "Trench Behemoth");
    const bears = spawn(game, "Grizzly Bears", B);
    a.chooseTargetsFn = () => [ref(bears)];
    enter(game, "Forest");
    const offer = attackOffer(game, B);
    expect(offer.mustAttack).toEqual([bears]);
    finishTurn(game);
    finishTurn(game);
    expect(attackOffer(game, B).mustAttack).toEqual([]);
    expect(game.state.attackRequirements ?? []).toEqual([]);
  });

  it("made during that player's combat, waits for their next one", () => {
    const { game, a } = table({ players: 2 });
    spawn(game, "Trench Behemoth");
    const bears = spawn(game, "Grizzly Bears", B);
    toPriority(game, B, "begin-combat", A);
    a.chooseTargetsFn = () => [ref(bears)];
    enter(game, "Forest");
    expect(attackOffer(game, B).mustAttack).toEqual([]);
    finishTurn(game);
    finishTurn(game);
    expect(attackOffer(game, B).mustAttack).toEqual([bears]);
  });
});

describe("creatures target opponent controls attack this turn if able (Imaginary Threats)", () => {
  it("binds every creature they control, anywhere, and holds them at their next untap", () => {
    const { game } = table({ players: 3 });
    lands(game, "Island", 4);
    const bears = spawn(game, "Grizzly Bears", B);
    const elf = spawn(game, "Llanowar Elves", B);
    const carols = spawn(game, "Grizzly Bears", C);
    const threats = toHand(game, "Imaginary Threats");
    toPriority(game, B, "begin-combat", A);
    cast(game, threats, { targets: [ref(B)] });
    const offer = attackOffer(game, B);
    expect([...offer.mustAttack].sort()).toEqual([bears, elf].sort() as ObjectId[]);
    expect(offer.defendersFor[bears]).toEqual(expect.arrayContaining([A, C]));
    void carols;
    expect(game.state.players[B].untapSkips).toEqual([{ type: "creature" }]);
  });
});

describe("each creature attacks each combat, a player other than you (Maximum Carnage)", () => {
  it("binds every creature until your next turn — another opponent's away from you", () => {
    const { game } = table({ players: 3 });
    const bears = spawn(game, "Grizzly Bears", B);
    const mine = spawn(game, "Grizzly Bears");
    enter(game, "Maximum Carnage");
    const offer = attackOffer(game, A);
    expect(offer.mustAttack).toEqual([mine]);
    finishTurn(game);
    const theirs = attackOffer(game, B);
    expect(theirs.mustAttack).toEqual([bears]);
    expect(theirs.defendersFor[bears]).toEqual([C]);
  });
});

describe("attacks a planeswalker if able (Gideon Jura's +2)", () => {
  it("binds only while that planeswalker is the same object (rule 400.7)", () => {
    const { game } = table({ players: 3 });
    const jace = spawn(game, "Jace Beleren");
    const bears = spawn(game, "Grizzly Bears", B);
    game.state.attackRequirements = [
      {
        by: A,
        filter: { type: "creature" },
        otherThanYou: false,
        controlledBy: B,
        attacks: jace,
        attacksStint: game.state.objects[jace].zoneChangeCount ?? 0,
        duration: { kind: "next-turn-of", player: B, after: game.state.turn.number },
      },
    ];
    const offer = attackOffer(game, B);
    expect(offer.mustAttack).toEqual([bears]);
    expect(offer.defendersFor[bears]).toEqual([jace]);
    finishTurn(game);
    // Jace left and came back: a new object the rule doesn't name.
    game.state.attackRequirements = [
      { by: A, filter: { type: "creature" }, otherThanYou: false, controlledBy: B, attacks: jace, attacksStint: 99 },
    ];
    expect(attackOffer(game, B).mustAttack).toEqual([]);
  });
});
