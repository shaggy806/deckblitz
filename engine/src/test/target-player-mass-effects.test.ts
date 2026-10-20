/**
 * "… all … target player controls" — `controlledByTarget` on `destroy-all`, `return-to-hand-all`,
 * `exile-all` and `tap-all`: the filter is read from the target player's side. River's Rebuke,
 * Overwhelming Forces, Rain of Daggers, Naya Charm.
 */
import { describe, expect, it } from "vitest";

import { A, B, cast, enter, hand, lands, life, loyalty, nextTurn, ref, spawn, table, toHand, toStep, zone } from "./harness.js";

describe("mass effects over a target player's permanents", () => {
  it("River's Rebuke returns only that player's nonland permanents", () => {
    const { game } = table();
    lands(game, "Island", 6);
    const mine = spawn(game, "Grizzly Bears");
    const theirs = spawn(game, "Hill Giant", B);
    const theirLand = spawn(game, "Forest", B);
    cast(game, toHand(game, "River's Rebuke"), { targets: [ref(B)] });
    expect(zone(game, theirs)).toBe("hand");
    expect(zone(game, theirLand)).toBe("battlefield");
    expect(zone(game, mine)).toBe("battlefield");
  });

  it("Overwhelming Forces draws for each creature actually destroyed", () => {
    const { game } = table();
    lands(game, "Swamp", 8);
    const mine = spawn(game, "Grizzly Bears");
    const bears = spawn(game, "Grizzly Bears", B);
    const giant = spawn(game, "Hill Giant", B);
    const colossus = spawn(game, "Darksteel Colossus", B);
    const before = hand(game).length;
    cast(game, toHand(game, "Overwhelming Forces"), { targets: [ref(B)] });
    expect(zone(game, bears)).toBe("graveyard");
    expect(zone(game, giant)).toBe("graveyard");
    expect(zone(game, colossus)).toBe("battlefield");
    expect(zone(game, mine)).toBe("battlefield");
    // The spell left the hand; two cards came back in.
    expect(hand(game).length).toBe(before + 2);
  });

  it("Rain of Daggers: 2 life for each creature destroyed", () => {
    const { game } = table();
    lands(game, "Swamp", 6);
    spawn(game, "Grizzly Bears", B);
    spawn(game, "Hill Giant", B);
    cast(game, toHand(game, "Rain of Daggers"), { targets: [ref(B)] });
    expect(life(game, A)).toBe(16);
  });

  it("Naya Charm taps all creatures target player controls", () => {
    const { game } = table();
    for (const land of ["Mountain", "Forest", "Plains"]) spawn(game, land);
    const mine = spawn(game, "Grizzly Bears");
    const theirs = spawn(game, "Hill Giant", B);
    cast(game, toHand(game, "Naya Charm"), { modes: [2], targets: [ref(B)] });
    expect(game.state.objects[theirs].tapped).toBe(true);
    expect(game.state.objects[mine].tapped).toBe(false);
  });
});

describe("Ajani Vengeant", () => {
  it("−7 destroys all lands target player controls", () => {
    const { game } = table();
    const ajani = spawn(game, "Ajani Vengeant");
    const myLand = spawn(game, "Plains");
    const theirLand = spawn(game, "Forest", B);
    loyalty(game, ajani, -7, { atLeast: 7, targets: [ref(B)] });
    expect(zone(game, theirLand)).toBe("graveyard");
    expect(zone(game, myLand)).toBe("battlefield");
  });
});

describe("Settle the Wreckage", () => {
  it("exiles the attackers, and their controller may fetch that many basic lands, tapped", () => {
    const { game, a } = table({ deck: "Forest" });
    const bears = spawn(game, "Grizzly Bears");
    const giant = spawn(game, "Hill Giant");
    for (const land of ["Plains", "Plains", "Island", "Island"]) spawn(game, land, B);
    a.declareAttackersFn = () => [
      { attacker: bears, defender: B },
      { attacker: giant, defender: B },
    ];
    a.chooseModesFn = () => [0];
    // She takes as many as she may.
    a.chooseFromZoneFn = (_view, eligible, _min, max) => eligible.slice(0, max);
    toStep(game, "declare-blockers");
    const wreck = toHand(game, "Settle the Wreckage", B);
    // Alice passes; Bob, holding priority in the declare-blockers step, casts it.
    game.dispatch({ type: "pass-priority", player: A });
    cast(game, wreck, { player: B, targets: [ref(A)] });
    expect(zone(game, bears)).toBe("exile");
    expect(zone(game, giant)).toBe("exile");
    const forests = game.state.zones.shared.battlefield.filter(
      (id) => game.state.objects[id].cardName === "Forest" && game.state.objects[id].controller === A,
    );
    expect(forests).toHaveLength(2);
    expect(forests.every((id) => game.state.objects[id].tapped)).toBe(true);
  });
});

describe("Assassin Gauntlet", () => {
  it("attaches to your creature and taps the target opponent's creatures", () => {
    const { game, a } = table();
    const bears = spawn(game, "Grizzly Bears");
    const theirs = spawn(game, "Hill Giant", B);
    a.chooseTargetsFn = () => [ref(bears), ref(B)];
    const gauntlet = enter(game, "Assassin Gauntlet");
    expect(game.state.objects[gauntlet].attachedTo).toBe(bears);
    expect(game.state.objects[theirs].tapped).toBe(true);
    expect(game.state.objects[bears].tapped).toBe(false);
  });
});

describe("Sleep", () => {
  it("taps that player's creatures, which stay tapped through that player's next untap step", () => {
    const { game } = table();
    lands(game, "Island", 4);
    const giant = spawn(game, "Hill Giant", B);
    const mine = spawn(game, "Grizzly Bears");
    cast(game, toHand(game, "Sleep"), { targets: [ref(B)] });
    expect(game.state.objects[giant].tapped).toBe(true);
    expect(game.state.objects[mine].tapped).toBe(false);
    nextTurn(game);
    expect(game.state.objects[giant].tapped).toBe(true);
    nextTurn(game);
    nextTurn(game);
    // Bob's following untap step untaps it.
    expect(game.state.objects[giant].tapped).toBe(false);
  });

  it("one that changes hands first untaps in its new controller's untap step", () => {
    const { game } = table();
    lands(game, "Island", 4);
    const giant = spawn(game, "Hill Giant", B);
    cast(game, toHand(game, "Sleep"), { targets: [ref(B)] });
    game.debugApplyEffect(A, { kind: "gain-control", target: 0, untilEndOfTurn: false }, [ref(giant)]);
    nextTurn(game);
    nextTurn(game);
    expect(game.state.objects[giant].controller).toBe(A);
    expect(game.state.objects[giant].tapped).toBe(false);
  });
});

describe("Mogg Infestation", () => {
  it("that player gets two Goblins for each creature that died this way", () => {
    const { game } = table();
    lands(game, "Mountain", 5);
    spawn(game, "Grizzly Bears", B);
    spawn(game, "Hill Giant", B);
    spawn(game, "Darksteel Colossus", B);
    cast(game, toHand(game, "Mogg Infestation"), { targets: [ref(B)] });
    const goblins = game.state.zones.shared.battlefield.filter(
      (id) => game.state.objects[id].cardName === "Goblin Token" && game.state.objects[id].controller === B,
    );
    expect(goblins.reduce((n, id) => n + (game.state.objects[id].stackCount ?? 1), 0)).toBe(4);
  });
});
