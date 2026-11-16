import { describe, expect, it } from "vitest";

import type { Game } from "../game.js";
import type { ObjectId, PlayerId } from "../primitives.js";
import type { TargetRef } from "../target.js";
import {
  A,
  B,
  activate,
  cast,
  enter,
  lands,
  life,
  pickTargets,
  ref,
  settle,
  spawn,
  table as openTable,
  toHand,
  zone,
} from "./harness.js";

// A spell or ability copied for each other permanent **or player** it could
// target (rule 707.10d) — the one in a target slot, not a trigger's spell:
// Radiate's spell, Radiant Performer's spell or ability. With players among
// them the copies are ordered a copy at a time; with permanents alone, in one
// `choose-permanents`.

function table(opts: Parameters<typeof openTable>[0] = {}): ReturnType<typeof openTable> {
  const seated = openTable(opts);
  for (const player of seated.players) seated.game.state.zones.perPlayer[player].hand = [];
  return seated;
}

/** Copies on the stack under this player, bottom first. */
const copiesOf = (game: Game, player: PlayerId): ObjectId[] =>
  game.state.zones.shared.stack.filter((id) => {
    const object = game.state.objects[id];
    return object?.isCopy === true && object.controller === player;
  });

const targetOf = (game: Game, id: ObjectId): TargetRef | undefined => game.state.objects[id].targets?.[0];

/** Both pass, the top of the stack resolves, and every question it raises is
 * answered by the seats — nothing more resolves. */
const passBoth = (game: Game): void => {
  game.dispatch({ type: "pass-priority", player: A });
  game.dispatch({ type: "pass-priority", player: B });
  game.advanceUntil((s) => s.awaiting === null);
};

describe("Radiate", () => {
  it("copies a Bolt for each other creature and player it could target, ordered a copy at a time", () => {
    const { game, a } = table();
    const mine = spawn(game, "Grizzly Bears", A);
    const theirs = spawn(game, "Grizzly Bears", B);
    lands(game, "Mountain", 6);
    const offers: (readonly TargetRef[])[] = [];
    // Bob's Bears first (resolves last), then Alice; Alice's Bears last, unasked.
    const order: TargetRef[] = [ref(theirs), ref(A)];
    a.choosePermanentOrPlayerFn = (_view, offer) => {
      offers.push(offer.eligible);
      return order[offers.length - 1];
    };
    cast(game, toHand(game, "Lightning Bolt"), { targets: [ref(B)], settle: false });
    const bolt = game.state.zones.shared.stack[game.state.zones.shared.stack.length - 1];
    cast(game, toHand(game, "Radiate"), { targets: [ref(bolt)], settle: false });
    passBoth(game);
    // Bob, the one it targets, is left out; lands and Radiate itself can't be.
    expect(offers[0].length).toBe(3);
    expect(offers[0]).toContainEqual(ref(A));
    expect(offers[0]).toContainEqual(ref(mine));
    expect(offers[0]).toContainEqual(ref(theirs));
    expect(offers[0]).not.toContainEqual(ref(B));
    expect(offers.length).toBe(2);
    const copies = copiesOf(game, A);
    expect(copies.map((id) => targetOf(game, id))).toEqual([ref(theirs), ref(A), ref(mine)]);
    settle(game);
    expect(life(game, A)).toBe(17);
    expect(life(game, B)).toBe(17);
    expect(zone(game, mine)).toBe("graveyard");
    expect(zone(game, theirs)).toBe("graveyard");
  });

  it("copies an opponent's spell under its own controller", () => {
    const { game, a } = table();
    const mine = spawn(game, "Grizzly Bears", A);
    lands(game, "Mountain", 1, B);
    lands(game, "Mountain", 5);
    game.dispatch({ type: "pass-priority", player: A });
    cast(game, toHand(game, "Lightning Bolt", B), { player: B, targets: [ref(mine)], settle: false });
    game.dispatch({ type: "pass-priority", player: B });
    const bolt = game.state.zones.shared.stack[0];
    // Alice and Bob, both players it could target, and no other permanent: the
    // order is still asked, and the second made unasked.
    let asked = 0;
    a.choosePermanentOrPlayerFn = (_view, offer) => {
      asked += 1;
      expect(offer.eligible).toEqual([ref(A), ref(B)]);
      return ref(B);
    };
    cast(game, toHand(game, "Radiate"), { targets: [ref(bolt)], settle: false });
    passBoth(game);
    expect(asked).toBe(1);
    expect(copiesOf(game, A).map((id) => targetOf(game, id))).toEqual([ref(B), ref(A)]);
    settle(game);
    expect(life(game, A)).toBe(17);
    expect(life(game, B)).toBe(17);
    expect(zone(game, mine)).toBe("graveyard");
  });

  it("can't target a spell aimed at two different things", () => {
    const { game } = table();
    const one = spawn(game, "Grizzly Bears", B);
    const two = spawn(game, "Grizzly Bears", B);
    lands(game, "Mountain", 8);
    cast(game, toHand(game, "Arc Trail"), { targets: [ref(one), ref(two)], settle: false });
    const arc = game.state.zones.shared.stack[0];
    expect(() => cast(game, toHand(game, "Radiate"), { targets: [ref(arc)], settle: false })).toThrow(/target/i);
  });
});

describe("Radiant Performer", () => {
  it("copies an ability for each other permanent and player it could target", () => {
    const { game, a } = table();
    const pyromancer = spawn(game, "Prodigal Pyromancer");
    const bears = spawn(game, "Grizzly Bears", B);
    lands(game, "Mountain", 5);
    const offers: (readonly TargetRef[])[] = [];
    a.choosePermanentOrPlayerFn = (_view, offer) => {
      offers.push(offer.eligible);
      return offer.eligible.find((t) => t.kind === "player" && t.player === A) ?? offer.eligible[0];
    };
    activate(game, pyromancer, 0, { targets: [ref(B)], settle: false });
    const ping = game.state.zones.shared.stack[0];
    const performer = toHand(game, "Radiant Performer");
    pickTargets(a, ping);
    cast(game, performer, { settle: false });
    passBoth(game);
    // Radiant Performer's trigger, aimed at the ping.
    expect(game.state.zones.shared.stack.length).toBe(2);
    passBoth(game);
    // Alice, the Pyromancer, the Bears and Radiant Performer: not Bob.
    expect(offers[0].length).toBe(4);
    expect(offers[0]).not.toContainEqual(ref(B));
    expect(offers[0]).toContainEqual(ref(performer));
    const copies = copiesOf(game, A);
    expect(copies.length).toBe(4);
    expect(copies.every((id) => game.state.objects[id].kind === "ability")).toBe(true);
    expect(targetOf(game, copies[0])).toEqual(ref(A));
    settle(game);
    expect(life(game, A)).toBe(19);
    expect(life(game, B)).toBe(19);
    expect(game.state.objects[bears].damageMarked).toBe(1);
  });

  it("copies an ability whose targets are permanents alone, ordered in one choice", () => {
    const { game, a } = table();
    const assassin = spawn(game, "Royal Assassin");
    const target = spawn(game, "Grizzly Bears", B, { tapped: true });
    const other = spawn(game, "Grizzly Bears", B, { tapped: true });
    const untapped = spawn(game, "Grizzly Bears", B);
    lands(game, "Mountain", 5);
    let offered: readonly ObjectId[] = [];
    a.choosePermanentsFn = (_view, eligible) => {
      offered = eligible;
      return eligible;
    };
    activate(game, assassin, 0, { targets: [ref(target)], settle: false });
    const kill = game.state.zones.shared.stack[0];
    pickTargets(a, kill);
    cast(game, toHand(game, "Radiant Performer"), { settle: false });
    passBoth(game);
    passBoth(game);
    // The other tapped creatures, Royal Assassin (tapped for its cost) among them.
    expect([...offered].sort()).toEqual([assassin, other].sort());
    settle(game);
    expect(zone(game, target)).toBe("graveyard");
    expect(zone(game, other)).toBe("graveyard");
    expect(zone(game, assassin)).toBe("graveyard");
    expect(zone(game, untapped)).toBe("battlefield");
  });

  it("doesn't trigger unless cast from the hand", () => {
    const { game } = table();
    const pyromancer = spawn(game, "Prodigal Pyromancer");
    activate(game, pyromancer, 0, { targets: [ref(B)], settle: false });
    enter(game, "Radiant Performer", A, { settle: false });
    expect(game.state.zones.shared.stack.length).toBe(1);
    settle(game);
    expect(life(game, B)).toBe(19);
    expect(life(game, A)).toBe(20);
  });
});
