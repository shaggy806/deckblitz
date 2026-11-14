/**
 * A journal word as an object set, `{ turnHistory, who? }`, under an
 * aggregate — "the total power of Daleks that died this turn" (Genesis of
 * the Daleks): a `sum` of `"power"` over the journal's `died` entries, each
 * with its power as it last existed (rule 603.10a), a token stack once per
 * token, whoever controlled them.
 */

import { describe, expect, it } from "vitest";

import type { Game } from "../game.js";
import type { ObjectId, PlayerId } from "../primitives.js";
import { A, B, C, destroy, enter, life, named, pickModes, pickTargets, ref, settle, spawn, table, zone } from "./harness.js";

const GENESIS = "Genesis of the Daleks";
const DALEK = "Dalek Token";

const daleks = (game: Game, player: PlayerId = A): number =>
  named(game, DALEK, player).reduce((n, id) => n + (game.state.objects[id].stackCount ?? 1), 0);

function makeDaleks(game: Game, count: number, player: PlayerId = A): void {
  game.debugApplyEffect(player, { kind: "create-token", token: DALEK, count });
  settle(game);
}

/** Chapter IV's effect at Bob, from a permanent of Alice's (a Genesis put
 * there would start its own chapter I). */
function chapterFour(game: Game): ObjectId {
  const saga = spawn(game, "Sol Ring");
  const chapter = game.registry.get(GENESIS).chapters?.find((c) => c.at.includes(4));
  if (chapter?.effect == null) throw new Error("no chapter IV");
  game.debugApplyEffect(A, chapter.effect, [ref(B)], { source: saga });
  return saga;
}

describe("Genesis of the Daleks — chapters I to III", () => {
  it("makes a Dalek for each lore counter: one, then two, then three", () => {
    const { game } = table();
    const saga = enter(game, GENESIS);
    expect(daleks(game)).toBe(1);
    game.debugApplyEffect(A, { kind: "add-counter", target: 0, counter: "lore", amount: 1 }, [ref(saga)]);
    settle(game);
    expect(daleks(game)).toBe(3);
    game.debugApplyEffect(A, { kind: "add-counter", target: 0, counter: "lore", amount: 1 }, [ref(saga)]);
    settle(game);
    expect(daleks(game)).toBe(6);
  });

  it("the fourth lore counter brings the choice, and then the Saga is sacrificed", () => {
    const { game, a, b } = table();
    const saga = enter(game, GENESIS);
    for (let i = 0; i < 2; i += 1) {
      game.debugApplyEffect(A, { kind: "add-counter", target: 0, counter: "lore", amount: 1 }, [ref(saga)]);
      settle(game);
    }
    const bears = spawn(game, "Grizzly Bears", B);
    pickTargets(a, B);
    pickModes(b, 0);
    game.debugApplyEffect(A, { kind: "add-counter", target: 0, counter: "lore", amount: 1 }, [ref(saga)]);
    settle(game);
    expect(daleks(game)).toBe(0);
    expect(zone(game, bears)).toBe("battlefield");
    expect(life(game, B)).toBe(2);
    expect(zone(game, saga)).toBe("graveyard");
  });
});

describe("Genesis of the Daleks — chapter IV's villainous choice", () => {
  it("destroying the Daleks: each opponent loses the total power of Daleks that died this turn", () => {
    const { game, a, b } = table({ players: 3 });
    makeDaleks(game, 2);
    // A Dalek of Bob's that died earlier this turn counts too, and a
    // non-Dalek doesn't.
    makeDaleks(game, 1, B);
    destroy(game, named(game, DALEK, B)[0]);
    destroy(game, spawn(game, "Craw Wurm", B));
    const bears = spawn(game, "Grizzly Bears", B);
    pickTargets(a, B);
    pickModes(b, 0);
    chapterFour(game);
    settle(game);
    expect(daleks(game)).toBe(0);
    expect(zone(game, bears)).toBe("battlefield");
    // Three Daleks, 3 power each.
    expect(life(game, B)).toBe(11);
    expect(life(game, C)).toBe(11);
    expect(life(game, A)).toBe(20);
  });

  it("a Dalek's power as it last existed", () => {
    const { game, a, b } = table();
    makeDaleks(game, 1);
    const [dalek] = named(game, DALEK, A);
    game.debugApplyEffect(A, { kind: "add-counter", target: 0, counter: "+1/+1", amount: 2 }, [ref(dalek)]);
    pickTargets(a, B);
    pickModes(b, 0);
    chapterFour(game);
    settle(game);
    expect(life(game, B)).toBe(15);
  });

  it("or destroying every non-Dalek creature", () => {
    const { game, a, b } = table();
    makeDaleks(game, 2);
    const bears = spawn(game, "Grizzly Bears", B);
    const mine = spawn(game, "Grizzly Bears", A);
    pickTargets(a, B);
    pickModes(b, 1);
    chapterFour(game);
    settle(game);
    expect(daleks(game)).toBe(2);
    expect(zone(game, bears)).toBe("graveyard");
    expect(zone(game, mine)).toBe("graveyard");
    expect(life(game, B)).toBe(20);
  });
});
