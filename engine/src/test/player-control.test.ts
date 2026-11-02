/**
 * Controlling another player (rule 723), and "you choose which creatures attack
 * and how they block". Who answers changes; nothing else does.
 */

import { describe, expect, it } from "vitest";
import { answeringPlayer, attackChooser, blockChooser, decidingPlayer, perspectiveOf, playersControlledBy } from "../player-control.js";
import { ScriptedController } from "../controller.js";
import { viewFor } from "../view.js";
import { activePlayerOf } from "../state.js";
import {
  A,
  B,
  C,
  activate,
  cast,
  lands,
  life,
  named,
  nextTurn,
  pickTargets,
  settle,
  spawn,
  table,
  toGraveyard,
  toHand,
  toStep,
  zone,
  type BlockOffer,
} from "./harness.js";
import type { Game } from "../game.js";
import type { PlayerId } from "../primitives.js";

const priorityTo = (game: Game, player: PlayerId): void => {
  while (game.state.priority.holder !== player) {
    game.dispatch({ type: "pass-priority", player: game.state.priority.holder! });
  }
};

/** Alice has Mindslaver ready and uses it on `on`. */
function slave(game: Game, on: PlayerId = B, by: PlayerId = A): void {
  priorityTo(game, by);
  lands(game, "Wastes", 4, by);
  activate(game, spawn(game, "Mindslaver", by), 0, { player: by, targets: [{ kind: "player", player: on }] });
}

describe("controlling a player during their next turn (rule 723)", () => {
  it("waits for their next turn, works all of it, and ends as the next begins (723.1)", () => {
    const { game } = table();
    slave(game);
    settle(game);
    expect(named(game, "Mindslaver", A)).toHaveLength(0);
    expect(decidingPlayer(game.state, B)).toBe(B);
    nextTurn(game, "upkeep");
    expect(activePlayerOf(game.state)).toBe(B);
    expect(decidingPlayer(game.state, B)).toBe(A);
    expect(playersControlledBy(game.state, A)).toEqual([B]);
    toStep(game, "end", B);
    expect(decidingPlayer(game.state, B)).toBe(A);
    nextTurn(game, "upkeep");
    expect(activePlayerOf(game.state)).toBe(A);
    expect(decidingPlayer(game.state, B)).toBe(B);
    expect(game.state.playerControl).toBeUndefined();
  });

  it("on the controlled player's own turn means the next one, not this one", () => {
    const { game } = table();
    lands(game, "Swamp", 8, B);
    // Bob's sorcery, at instant speed for the test: its controller is what counts.
    lands(game, "Wastes", 4, B);
    slave(game, A, B);
    expect(decidingPlayer(game.state, A)).toBe(A);
    nextTurn(game); // Bob's
    expect(decidingPlayer(game.state, A)).toBe(A);
    nextTurn(game); // Alice's
    expect(activePlayerOf(game.state)).toBe(A);
    expect(decidingPlayer(game.state, A)).toBe(B);
  });

  it("changes only who answers: the player stays active and their cards and mana are theirs (723.3, 723.5a)", () => {
    const { game, a, b } = table();
    slave(game);
    settle(game);
    nextTurn(game);
    const bears = toHand(game, "Grizzly Bears", B);
    lands(game, "Forest", 2, B);
    lands(game, "Forest", 2, A);
    // Their spell, cast for them, is theirs: the mana is, and it stays theirs.
    cast(game, bears, { player: B });
    expect(zone(game, bears)).toBe("battlefield");
    expect(game.state.objects[bears].controller).toBe(B);
    const aliceForests = named(game, "Forest", A);
    expect(aliceForests.every((id) => !game.state.objects[id].tapped)).toBe(true);
    expect(named(game, "Forest", B).every((id) => game.state.objects[id].tapped)).toBe(true);
    // And the game's controllers answer through the one who decides.
    let bobAsked = 0;
    b.declareAttackersFn = () => {
      bobAsked += 1;
      return [];
    };
    const asBob = new ScriptedController(B);
    let aliceAsked = 0;
    asBob.declareAttackersFn = () => {
      aliceAsked += 1;
      return [];
    };
    a.standInFn = () => asBob;
    spawn(game, "Grizzly Bears", B);
    game.state.objects[named(game, "Grizzly Bears", B).at(-1)!].summoningSick = false;
    toStep(game, "postcombat-main", B);
    expect(aliceAsked).toBe(1);
    expect(bobAsked).toBe(0);
  });

  it("the last one created works (723.1a), a player given control of themselves answers for themselves (723.9)", () => {
    const { game } = table({ players: 3 });
    slave(game, B, C);
    slave(game, B, A);
    nextTurn(game, "upkeep");
    expect(activePlayerOf(game.state)).toBe(B);
    expect(decidingPlayer(game.state, B)).toBe(A);

    const second = table();
    slave(second.game, B, A);
    slave(second.game, B, B);
    nextTurn(second.game, "upkeep");
    expect(decidingPlayer(second.game.state, B)).toBe(B);
  });

  it("ends when the controlling player leaves the game (800.4a)", () => {
    const { game } = table({ players: 3 });
    slave(game, B, A);
    nextTurn(game, "upkeep");
    expect(decidingPlayer(game.state, B)).toBe(A);
    game.concede(A);
    expect(decidingPlayer(game.state, B)).toBe(B);
  });

  it("a controlled player may still concede (723.6)", () => {
    const { game } = table({ players: 3 });
    slave(game);
    nextTurn(game, "upkeep");
    game.concede(B);
    expect(game.state.players[B].hasLost).toBe(true);
  });

  it("a controller keeps making their own decisions (723.8): their own priority is theirs", () => {
    const { game } = table();
    slave(game);
    nextTurn(game, "upkeep");
    expect(game.state.priority.holder).toBe(B);
    expect(answeringPlayer(game.state, B)).toBe(A);
    game.dispatch({ type: "pass-priority", player: B });
    expect(game.state.priority.holder).toBe(A);
    expect(answeringPlayer(game.state, A)).toBe(A);
  });

  it("Worst Fears exiles itself; Cruel Entertainment hands each player the other's next turn", () => {
    const { game } = table({ players: 3 });
    lands(game, "Swamp", 8);
    const fears = toHand(game, "Worst Fears");
    cast(game, fears, { targets: [{ kind: "player", player: C }] });
    expect(zone(game, fears)).toBe("exile");

    const cruel = table({ players: 3 });
    lands(cruel.game, "Swamp", 7);
    cast(cruel.game, toHand(cruel.game, "Cruel Entertainment"), {
      targets: [
        { kind: "player", player: B },
        { kind: "player", player: C },
      ],
    });
    nextTurn(cruel.game, "upkeep");
    expect(activePlayerOf(cruel.game.state)).toBe(B);
    expect(decidingPlayer(cruel.game.state, B)).toBe(C);
    nextTurn(cruel.game, "upkeep");
    expect(activePlayerOf(cruel.game.state)).toBe(C);
    expect(decidingPlayer(cruel.game.state, C)).toBe(B);
  });

  it("Emrakul: cheaper for each type in your graveyard, and an extra turn after the controlled one, not itself controlled", () => {
    const { game, a } = table();
    toGraveyard(game, "Grizzly Bears");
    toGraveyard(game, "Wastes");
    toGraveyard(game, "Lightning Bolt");
    lands(game, "Wastes", 10);
    pickTargets(a, B);
    cast(game, toHand(game, "Emrakul, the Promised End"));
    expect(named(game, "Emrakul, the Promised End", A)).toHaveLength(1);
    nextTurn(game);
    expect(activePlayerOf(game.state)).toBe(B);
    expect(decidingPlayer(game.state, B)).toBe(A);
    expect(game.state.turn.isExtra).toBeFalsy();
    nextTurn(game);
    expect(activePlayerOf(game.state)).toBe(B);
    expect(game.state.turn.isExtra).toBe(true);
    expect(decidingPlayer(game.state, B)).toBe(B);
    nextTurn(game);
    expect(activePlayerOf(game.state)).toBe(A);
  });

  it("Secret of Bloodbending: their next combat phase, or with its waterbend paid their whole next turn", () => {
    const { game } = table();
    lands(game, "Island", 4);
    const secret = toHand(game, "Secret of Bloodbending");
    cast(game, secret, { targets: [{ kind: "player", player: B }] });
    expect(zone(game, secret)).toBe("exile");
    nextTurn(game);
    expect(decidingPlayer(game.state, B)).toBe(B);
    toStep(game, "begin-combat", B);
    expect(decidingPlayer(game.state, B)).toBe(A);
    toStep(game, "postcombat-main", B);
    expect(decidingPlayer(game.state, B)).toBe(B);
    expect(game.state.playerControl).toEqual([]);

    const paid = table();
    lands(paid.game, "Island", 14);
    cast(paid.game, toHand(paid.game, "Secret of Bloodbending"), {
      targets: [{ kind: "player", player: B }],
      kicked: true,
      waterbend: [],
    });
    nextTurn(paid.game);
    expect(decidingPlayer(paid.game.state, B)).toBe(A);
  });
});

describe("what a player controlling another sees (723.4)", () => {
  it("their hand, while it lasts", () => {
    const { game } = table();
    const card = toHand(game, "Grizzly Bears", B);
    slave(game);
    settle(game);
    expect(viewFor(game.state, game.registry, A).objects[card]).toBeUndefined();
    nextTurn(game, "upkeep");
    const sees = viewFor(game.state, game.registry, A);
    expect(sees.objects[card]?.cardName).toBe("Grizzly Bears");
    expect(sees.perspective).toBe(B);
    expect(sees.playerControl).toEqual([{ controlled: B, controller: A, during: "next-turn" }]);
    // The controlled player sees what they saw, and who has them.
    const theirs = viewFor(game.state, game.registry, B);
    expect(theirs.perspective).toBeUndefined();
    expect(theirs.playerControl).toEqual([{ controlled: B, controller: A, during: "next-turn" }]);
    nextTurn(game, "upkeep");
    expect(viewFor(game.state, game.registry, A).objects[card]).toBeUndefined();
  });

  it("a third player sees none of it", () => {
    const { game } = table({ players: 3 });
    const card = toHand(game, "Grizzly Bears", B);
    slave(game);
    nextTurn(game, "upkeep");
    expect(viewFor(game.state, game.registry, C).objects[card]).toBeUndefined();
    expect(viewFor(game.state, game.registry, C).perspective).toBeUndefined();
  });

  it("not their sideboard, and a wish made for them finds nothing there (Mindslaver's ruling)", () => {
    const { game } = table({ sideboard: ["Demonic Tutor"] });
    lands(game, "Wastes", 4, B);
    slave(game, A, B);
    nextTurn(game);
    nextTurn(game);
    expect(activePlayerOf(game.state)).toBe(A);
    expect(decidingPlayer(game.state, A)).toBe(B);
    const tutor = game.state.outside![A][0];
    expect(viewFor(game.state, game.registry, B).objects[tutor]).toBeUndefined();
    expect(viewFor(game.state, game.registry, A).objects[tutor]?.cardName).toBe("Demonic Tutor");
    lands(game, "Mountain", 2);
    const wish = toHand(game, "Burning Wish");
    cast(game, wish, { settle: false });
    game.advanceUntil((s) => s.zones.shared.stack.length === 0);
    expect(zone(game, tutor)).toBe("outside");
    expect(zone(game, wish)).toBe("exile");
  });
});

describe("you choose which creatures attack (Master Warcraft)", () => {
  function warcraft(players: 2 | 3 = 2) {
    const t = table({ players });
    const { game } = t;
    lands(game, "Mountain", 4);
    return t;
  }

  it("can't be cast once attackers have been declared", () => {
    const { game } = warcraft();
    toStep(game, "begin-combat");
    const card = toHand(game, "Master Warcraft");
    expect(game.canDispatch({ type: "cast-spell", player: A, card, targets: [] })).toBeNull();
    toStep(game, "declare-attackers");
    expect(game.canDispatch({ type: "cast-spell", player: A, card, targets: [] })).not.toBeNull();
    toStep(game, "postcombat-main");
    expect(game.canDispatch({ type: "cast-spell", player: A, card, targets: [] })).not.toBeNull();
  });

  it("the caster's own turn changes nothing; another's turn, the caster names the attackers; it lasts this turn", () => {
    const { game } = warcraft();
    cast(game, toHand(game, "Master Warcraft"));
    expect(attackChooser(game.state, A)).toBeNull();
    expect(attackChooser(game.state, B)).toBe(A);
    expect(blockChooser(game.state, B)).toBe(A);
    // It lasts this turn alone.
    nextTurn(game);
    expect(attackChooser(game.state, B)).toBeNull();
  });

  /** Bob casts it on alice's turn: she has `names`, he names. */
  function onAlicesTurn(names: readonly string[], players: 2 | 3 = 2) {
    const t = warcraft(players);
    const { game } = t;
    const ids = names.map((name) => spawn(game, name, A));
    lands(game, "Mountain", 4, B);
    priorityTo(game, B);
    cast(game, toHand(game, "Master Warcraft", B), { player: B, settle: false });
    return { ...t, ids };
  }

  /** Bob's Master Warcraft resolved; alice's turn has reached the declaration. */
  function resolveToDeclaration(game: Game): void {
    game.advanceUntil((s) => s.awaiting?.kind === "attackers" || s.zones.shared.stack.length === 0);
    game.advanceUntil((s) => s.awaiting?.kind === "attackers");
  }

  it("with one defender and no cost, one step: the chooser's group is the attack", () => {
    const { game, ids } = onAlicesTurn(["Grizzly Bears", "Grizzly Bears"]);
    resolveToDeclaration(game);
    expect(answeringPlayer(game.state, A)).toBe(B);
    expect(perspectiveOf(game.state, B)).toBe(A);
    game.dispatch({ type: "declare-attackers", player: A, attackers: [{ attacker: ids[1], defender: B }] });
    expect(game.state.objects[ids[1]].attacking).toBe(B);
    expect(game.state.objects[ids[0]].attacking).toBeNull();
  });

  it("with a planeswalker to attack, the chooser names the group and the active player sends it (the 2008 ruling)", () => {
    const { game, ids } = onAlicesTurn(["Grizzly Bears", "Grizzly Bears"]);
    const walker = spawn(game, "Liliana of the Veil", B);
    resolveToDeclaration(game);
    const naming = game.legalActions(A).find((o) => o.kind === "declare-attackers");
    if (naming?.kind !== "declare-attackers") throw new Error("no offer");
    expect(naming.defendersFor[ids[0]]).toHaveLength(1);
    game.dispatch({ type: "declare-attackers", player: A, attackers: [{ attacker: ids[0], defender: B }] });
    // The second step is alice's, and only the group goes.
    expect(game.state.awaiting).toMatchObject({ kind: "attackers", player: A, group: [ids[0]] });
    expect(answeringPlayer(game.state, A)).toBe(A);
    const sending = game.legalActions(A).find((o) => o.kind === "declare-attackers");
    if (sending?.kind !== "declare-attackers") throw new Error("no offer");
    expect(sending.eligible).toEqual([ids[0]]);
    expect(sending.defendersFor[ids[0]]).toEqual(expect.arrayContaining([B, walker]));
    expect(sending.mustAttack).toEqual([ids[0]]);
    expect(game.canDispatch({ type: "declare-attackers", player: A, attackers: [] })).not.toBeNull();
    expect(
      game.canDispatch({ type: "declare-attackers", player: A, attackers: [{ attacker: ids[1], defender: walker }] }),
    ).not.toBeNull();
    game.dispatch({ type: "declare-attackers", player: A, attackers: [{ attacker: ids[0], defender: walker }] });
    expect(game.state.objects[ids[0]].attacking).toBe(walker);
  });

  it("a creature that must attack if able stays in the chooser's group", () => {
    const { game, ids } = onAlicesTurn(["Bloodrock Cyclops", "Grizzly Bears"]);
    resolveToDeclaration(game);
    expect(game.canDispatch({ type: "declare-attackers", player: A, attackers: [] })).not.toBeNull();
    expect(game.canDispatch({ type: "declare-attackers", player: A, attackers: [{ attacker: ids[0], defender: B }] })).toBeNull();
  });

  it("an attack that costs: the controller may refuse to pay, and the chooser proposes again without it", () => {
    const { game, ids } = onAlicesTurn(["Grizzly Bears", "Grizzly Bears"]);
    spawn(game, "Ghostly Prison", B);
    resolveToDeclaration(game);
    game.dispatch({ type: "declare-attackers", player: A, attackers: ids.map((attacker) => ({ attacker, defender: B })) });
    expect(game.state.awaiting).toMatchObject({ kind: "attackers", group: ids });
    expect(answeringPlayer(game.state, A)).toBe(A);
    // Alice sends one, which she can't pay for; refusing the other is allowed.
    game.dispatch({ type: "declare-attackers", player: A, attackers: [] });
    expect(game.state.awaiting).toMatchObject({ kind: "attackers", player: A });
    expect(answeringPlayer(game.state, A)).toBe(B);
    const again = game.legalActions(A).find((o) => o.kind === "declare-attackers");
    if (again?.kind !== "declare-attackers") throw new Error("no offer");
    expect(again.eligible).toEqual([]);
    game.dispatch({ type: "declare-attackers", player: A, attackers: [] });
    expect(game.state.awaiting?.kind).not.toBe("attackers");
    expect(game.state.attackChoiceRefused).toBeUndefined();
  });

  it("takes precedence over a player being controlled (Cruel Entertainment's ruling)", () => {
    const { game } = table({ players: 3 });
    slave(game, B, C);
    nextTurn(game);
    expect(decidingPlayer(game.state, B)).toBe(C);
    const bears = spawn(game, "Grizzly Bears", B);
    lands(game, "Mountain", 4);
    // Alice's, while Bob holds priority under Carol: an instant cast in Bob's turn.
    game.dispatch({ type: "pass-priority", player: B });
    game.advanceUntil((s) => s.priority.holder === A);
    game.dispatch({ type: "cast-spell", player: A, card: toHand(game, "Master Warcraft"), targets: [] });
    game.advanceUntil((s) => s.awaiting?.kind === "attackers");
    expect(answeringPlayer(game.state, B)).toBe(A);
    game.dispatch({ type: "declare-attackers", player: B, attackers: [{ attacker: bears, defender: A }] });
    // Alice named the group; who it's sent at is Bob's to say, so Carol's.
    expect(game.state.awaiting).toMatchObject({ kind: "attackers", player: B, group: [bears] });
    expect(answeringPlayer(game.state, B)).toBe(C);
  });
});

describe("you choose how creatures block (Master Warcraft, Brutal Hordechief)", () => {
  it("Master Warcraft: the chooser decides the blocks, a creature needn't block", () => {
    const { game } = table();
    const bears = spawn(game, "Grizzly Bears", A);
    const wall = spawn(game, "Grizzly Bears", B);
    lands(game, "Mountain", 4);
    cast(game, toHand(game, "Master Warcraft"));
    toStep(game, "declare-attackers");
    game.advanceUntil((s) => s.awaiting?.kind === "attackers");
    game.dispatch({ type: "declare-attackers", player: A, attackers: [{ attacker: bears, defender: B }] });
    game.advanceUntil((s) => s.awaiting?.kind === "blockers");
    expect(game.state.awaiting).toMatchObject({ kind: "blockers", player: B });
    expect(answeringPlayer(game.state, B)).toBe(A);
    expect(perspectiveOf(game.state, A)).toBe(B);
    game.dispatch({ type: "declare-blockers", player: B, blocks: [{ blocker: wall, attacker: bears }] });
    expect(game.state.objects[wall].blocking).toBeDefined();
  });

  function hordechiefTable(players: 2 | 3 = 2) {
    const t = table({ players });
    const chief = spawn(t.game, "Brutal Hordechief", A);
    lands(t.game, "Mountain", 5);
    return { ...t, chief };
  }

  it("Brutal Hordechief: opponents' creatures block if able, a later arrival too, and its controller chooses how", () => {
    const { game, chief } = hordechiefTable();
    const bears = spawn(game, "Grizzly Bears", A);
    activate(game, chief, 0);
    expect(blockChooser(game.state, B)).toBe(A);
    expect(blockChooser(game.state, A)).toBeNull();
    const late = spawn(game, "Grizzly Bears", B);
    toStep(game, "declare-attackers");
    game.advanceUntil((s) => s.awaiting?.kind === "attackers");
    game.dispatch({ type: "declare-attackers", player: A, attackers: [{ attacker: bears, defender: B }] });
    game.advanceUntil((s) => s.awaiting?.kind === "blockers");
    expect(answeringPlayer(game.state, B)).toBe(A);
    const offer = game.legalActions(B).find((o): o is BlockOffer => o.kind === "declare-blockers");
    expect(offer?.blockRequirements).toEqual([{ blocker: late }]);
    expect(game.canDispatch({ type: "declare-blockers", player: B, blocks: [] })).not.toBeNull();
    game.dispatch({ type: "declare-blockers", player: B, blocks: [{ blocker: late, attacker: bears }] });
    expect(game.state.objects[late].blocking).toBeDefined();
  });

  it("two of them: the last to resolve chooses for those who didn't resolve it (the ruling)", () => {
    const { game, chief } = hordechiefTable(3);
    activate(game, chief, 0);
    const second = spawn(game, "Brutal Hordechief", B);
    lands(game, "Mountain", 5, B);
    priorityTo(game, B);
    activate(game, second, 0, { player: B });
    expect(blockChooser(game.state, C)).toBe(B);
    expect(blockChooser(game.state, A)).toBe(B);
    expect(blockChooser(game.state, B)).toBe(A);
  });

  it("its trigger drains the defending player of each attacker", () => {
    const { game, chief } = hordechiefTable();
    game.state.objects[chief].summoningSick = false;
    toStep(game, "declare-attackers");
    game.advanceUntil((s) => s.awaiting?.kind === "attackers");
    game.dispatch({ type: "declare-attackers", player: A, attackers: [{ attacker: chief, defender: B }] });
    settle(game);
    expect(life(game, B)).toBe(19);
    expect(life(game, A)).toBe(21);
  });

  it("the stand-in obeys what must block", () => {
    const { game, a, chief } = hordechiefTable();
    const bears = spawn(game, "Grizzly Bears", A);
    const wall = spawn(game, "Grizzly Bears", B);
    activate(game, chief, 0);
    a.declareAttackersFn = () => [{ attacker: bears, defender: B }];
    toStep(game, "postcombat-main");
    expect(zone(game, wall)).toBe("graveyard");
    // Blocked: the trigger's 1 life alone.
    expect(life(game, B)).toBe(19);
  });
});
