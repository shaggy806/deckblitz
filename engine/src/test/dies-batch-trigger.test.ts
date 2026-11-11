/**
 * "Whenever one or more creatures die": a batched `dies` trigger, off the
 * `permanents-died` event, once per simultaneous event. Vengeful Townsfolk's
 * "other creatures you control", Seer of Stolen Sight's "artifacts and/or
 * creatures you control ... put into a graveyard from the battlefield", Rinoa,
 * Angel Wing's "attacking creatures you control ... return one of them".
 */

import { describe, expect, it } from "vitest";

import { defineCard } from "../cards/define.js";
import type { EffectSpec } from "../effects.js";
import type { CardFilter } from "../filter.js";
import type { Game } from "../game.js";
import type { ObjectId } from "../primitives.js";
import {
  A,
  B,
  counters,
  destroy,
  graveyard,
  keywords,
  life,
  named,
  pickFromZone,
  pt,
  settle,
  spawn,
  table,
  toStep,
  tokensNamed,
  zone,
} from "./harness.js";
import type { Table } from "./harness.js";

const wrath = (game: Game): void => {
  game.debugApplyEffect(A, { kind: "destroy-all", filter: { type: "creature" } }, []);
  settle(game);
};

const COUNTER = "Test Batch Counter";
const ARTIFACT_WATCH = "Test Batch Artifact Watcher";
const watcher = (name: string, filter: CardFilter, effect: EffectSpec) =>
  defineCard({
    name,
    manaCost: "{0}",
    types: ["enchantment"],
    text: name,
    triggered: [
      {
        trigger: { on: "dies", who: "any", filter, batched: true },
        targets: [],
        effect,
        resolve: null,
        text: name,
      },
    ],
  });

/** A table with the test's two watchers known to its game. */
const board = (): Table => {
  const t = table({ ownRegistry: true });
  t.game.registry.register(watcher(COUNTER, { type: "creature" }, { kind: "gain-life", amount: { triggerValue: true } }));
  t.game.registry.register(watcher(ARTIFACT_WATCH, { type: "artifact" }, { kind: "gain-life", amount: 1 }));
  return t;
};

/** Stops in the declare-blockers step, with `attackers` still attacking. */
const attackNow = (t: Table, attackers: readonly ObjectId[]): void => {
  t.a.declareAttackersFn = () => attackers.map((attacker) => ({ attacker, defender: B }));
  toStep(t.game, "declare-blockers");
};

const steal = (game: Game, id: ObjectId): void => {
  game.debugApplyEffect(A, { kind: "gain-control", target: 0, untilEndOfTurn: false }, [{ kind: "object", object: id }]);
  settle(game);
  game.state.objects[id].summoningSick = false;
};

describe("a batched dies trigger", () => {
  it("fires once for everything a wrath kills, with how many", () => {
    const { game } = board();
    spawn(game, COUNTER);
    spawn(game, "Grizzly Bears", A);
    spawn(game, "Grizzly Bears", B);
    spawn(game, "Grizzly Bears", B);
    wrath(game);
    expect(life(game)).toBe(23);
  });

  it("fires once per event: two deaths apart are two triggers", () => {
    const { game } = board();
    spawn(game, COUNTER);
    destroy(game, spawn(game, "Grizzly Bears", B));
    destroy(game, spawn(game, "Grizzly Bears", B));
    expect(life(game)).toBe(22);
  });

  it("is a state-based sweep's one event too", () => {
    const { game } = board();
    spawn(game, COUNTER);
    spawn(game, "Grizzly Bears", A);
    spawn(game, "Grizzly Bears", B);
    // -2/-2 to each: both die in one state-based check (rule 704.3).
    game.debugApplyEffect(
      A,
      { kind: "modify-pt-all", filter: { type: "creature" }, power: -2, toughness: -2, duration: "end-of-turn" },
      [],
    );
    toStep(game, "begin-combat");
    settle(game);
    expect(graveyard(game, B).length).toBe(1);
    expect(life(game)).toBe(22);
  });

  it("doesn't fire with nothing matching", () => {
    const { game } = board();
    spawn(game, ARTIFACT_WATCH);
    destroy(game, spawn(game, "Grizzly Bears", B));
    expect(life(game)).toBe(20);
    destroy(game, spawn(game, "Sol Ring", B));
    expect(life(game)).toBe(21);
  });

  it("counts a token stack as each of its tokens, and fires once for it", () => {
    const { game } = board();
    spawn(game, COUNTER);
    game.debugApplyEffect(A, { kind: "create-token", token: "Goblin Token", count: 4 }, []);
    settle(game);
    expect(tokensNamed(game, "Goblin Token")).toBe(4);
    wrath(game);
    expect(life(game)).toBe(24);
  });

  it("sees creatures by who controlled them when they died, whoever owns them", () => {
    const { game } = board();
    const townsfolk = spawn(game, "Vengeful Townsfolk");
    const stolen = spawn(game, "Grizzly Bears", B);
    steal(game, stolen);
    destroy(game, stolen);
    expect(counters(game, townsfolk)).toBe(1);
  });

  it("is doubled once by a doubler for a creature dying, however many died", () => {
    const { game } = board();
    spawn(game, "Teysa Karlov");
    spawn(game, ARTIFACT_WATCH);
    const townsfolk = spawn(game, "Vengeful Townsfolk");
    spawn(game, "Grizzly Bears");
    spawn(game, "Grizzly Bears");
    game.debugApplyEffect(A, { kind: "destroy-all", filter: { name: "Grizzly Bears" } }, []);
    settle(game);
    expect(counters(game, townsfolk)).toBe(2);
    // An artifact's death isn't a creature dying: it isn't doubled, though a
    // creature died beside it.
    spawn(game, "Sol Ring", B);
    spawn(game, "Grizzly Bears", B);
    game.debugApplyEffect(
      A,
      { kind: "destroy-all", filter: { typesAnyOf: ["artifact", "creature"], controlledBy: "opponent" } },
      [],
    );
    settle(game);
    expect(life(game)).toBe(21);
  });

  it("with 'other', doesn't see its own death alone, but sees those dying with it", () => {
    const t = table({ ownRegistry: true });
    t.game.registry.register(
      defineCard({
        name: "Test Batch Other",
        manaCost: "{0}",
        types: ["creature"],
        power: 1,
        toughness: 1,
        text: "Test Batch Other",
        triggered: [
          {
            trigger: { on: "dies", who: "any", filter: { type: "creature" }, otherOnly: true, batched: true },
            targets: [],
            effect: { kind: "gain-life", amount: { triggerValue: true } },
            resolve: null,
            text: "Test Batch Other",
          },
        ],
      }),
    );
    destroy(t.game, spawn(t.game, "Test Batch Other"));
    expect(life(t.game)).toBe(20);
    spawn(t.game, "Test Batch Other");
    spawn(t.game, "Grizzly Bears", B);
    spawn(t.game, "Grizzly Bears", B);
    wrath(t.game);
    expect(life(t.game)).toBe(22);
  });
});

describe("Vengeful Townsfolk", () => {
  it("grows once for creatures you control dying together, not for an opponent's", () => {
    const { game } = table();
    const townsfolk = spawn(game, "Vengeful Townsfolk");
    const bears = [spawn(game, "Grizzly Bears"), spawn(game, "Grizzly Bears")];
    game.debugApplyEffect(A, { kind: "destroy-all", filter: { name: "Grizzly Bears" } }, []);
    settle(game);
    expect(bears.map((b) => zone(game, b))).toEqual(["graveyard", "graveyard"]);
    expect(pt(game, townsfolk)).toEqual({ power: 4, toughness: 4 });
    destroy(game, spawn(game, "Grizzly Bears", B));
    expect(counters(game, townsfolk)).toBe(1);
  });

});

describe("Seer of Stolen Sight", () => {
  it("surveils once for an artifact and a creature of yours going together, itself included", () => {
    const { game, a } = table();
    let surveils = 0;
    a.chooseScryFn = () => {
      surveils += 1;
      return [];
    };
    spawn(game, "Seer of Stolen Sight");
    spawn(game, "Sol Ring");
    spawn(game, "Grizzly Bears");
    game.debugApplyEffect(B, { kind: "destroy-all", filter: { typesAnyOf: ["artifact", "creature"] } }, []);
    settle(game);
    expect(surveils).toBe(1);
  });

  it("sees its own death alone (rule 603.10a), and an opponent's never", () => {
    const { game, a } = table();
    let surveils = 0;
    a.chooseScryFn = () => {
      surveils += 1;
      return [];
    };
    const seer = spawn(game, "Seer of Stolen Sight");
    destroy(game, spawn(game, "Grizzly Bears", B));
    expect(surveils).toBe(0);
    destroy(game, seer);
    expect(surveils).toBe(1);
  });
});

describe("Rinoa, Angel Wing", () => {
  const twoAttackers = () => {
    const t = table();
    const rinoa = spawn(t.game, "Rinoa, Angel Wing");
    const first = spawn(t.game, "Grizzly Bears");
    const second = spawn(t.game, "Hill Giant");
    attackNow(t, [first, second]);
    return { ...t, rinoa, first, second };
  };

  it("returns the chosen one tapped under its owner's control with a flying counter", () => {
    const { game, a, first, second } = twoAttackers();
    a.chooseModesFn = () => [0];
    const answer = pickFromZone(a, second);
    game.debugApplyEffect(B, { kind: "destroy-all", filter: { attacking: true } }, []);
    settle(game);
    expect(answer.offered).toEqual(expect.arrayContaining([first, second]));
    expect(zone(game, first)).toBe("graveyard");
    expect(zone(game, second)).toBe("battlefield");
    expect(game.state.objects[second].tapped).toBe(true);
    expect(game.state.objects[second].controller).toBe(A);
    expect(counters(game, second, "flying")).toBe(1);
    expect(keywords(game, second).has("flying")).toBe(true);
    // Returned, not put into the attack.
    expect(game.state.objects[second].attacking).toBeNull();
  });

  it("takes a stolen creature back to its owner", () => {
    const t = table();
    spawn(t.game, "Rinoa, Angel Wing");
    const theirs = spawn(t.game, "Grizzly Bears", B);
    steal(t.game, theirs);
    attackNow(t, [theirs]);
    t.a.chooseModesFn = () => [0];
    destroy(t.game, theirs);
    expect(zone(t.game, theirs)).toBe("battlefield");
    expect(t.game.state.objects[theirs].owner).toBe(B);
    expect(t.game.state.objects[theirs].controller).toBe(B);
  });

  it("sees herself die with them (the ruling) and may return herself", () => {
    const t = table();
    const rinoa = spawn(t.game, "Rinoa, Angel Wing");
    const bears = spawn(t.game, "Grizzly Bears");
    attackNow(t, [rinoa, bears]);
    t.a.chooseModesFn = () => [0];
    const answer = pickFromZone(t.a, rinoa);
    t.game.debugApplyEffect(B, { kind: "destroy-all", filter: { attacking: true } }, []);
    settle(t.game);
    expect(answer.offered).toEqual(expect.arrayContaining([rinoa, bears]));
    expect(zone(t.game, rinoa)).toBe("battlefield");
    expect(zone(t.game, bears)).toBe("graveyard");
  });

  it("does it only once each turn: declining doesn't use it up, doing it does", () => {
    const { game, a, first, second } = twoAttackers();
    let asked = 0;
    a.chooseModesFn = () => {
      asked += 1;
      return asked === 1 ? [] : [0];
    };
    destroy(game, first);
    expect(asked).toBe(1);
    expect(zone(game, first)).toBe("graveyard");
    destroy(game, second);
    expect(asked).toBe(2);
    expect(zone(game, second)).toBe("battlefield");
    // Done this turn. It's no longer attacking anyway, so a third attacker's
    // death is what would ask again.
    const third = spawn(game, "Grizzly Bears");
    game.state.objects[third].attacking = B;
    destroy(game, third);
    expect(asked).toBe(2);
    expect(zone(game, third)).toBe("graveyard");
  });

  it("offers nothing for a token, and doesn't use up the turn's return", () => {
    const t = table();
    spawn(t.game, "Rinoa, Angel Wing");
    t.game.debugApplyEffect(A, { kind: "create-token", token: "Goblin Token", count: 1 }, []);
    settle(t.game);
    const goblin = named(t.game, "Goblin Token", A)[0];
    t.game.state.objects[goblin].summoningSick = false;
    const bears = spawn(t.game, "Grizzly Bears");
    attackNow(t, [goblin, bears]);
    let asked = 0;
    t.a.chooseModesFn = () => {
      asked += 1;
      return [0];
    };
    destroy(t.game, goblin);
    expect(asked).toBe(0);
    destroy(t.game, bears);
    expect(asked).toBe(1);
    expect(zone(t.game, bears)).toBe("battlefield");
  });

  it("doesn't see a creature that wasn't attacking", () => {
    const t = table();
    spawn(t.game, "Rinoa, Angel Wing");
    const bears = spawn(t.game, "Grizzly Bears");
    let asked = 0;
    t.a.chooseModesFn = () => {
      asked += 1;
      return [0];
    };
    destroy(t.game, bears);
    expect(asked).toBe(0);
    expect(graveyard(t.game)).toContain(bears);
  });

  it("makes her fliers bigger and vigilant at the beginning of combat", () => {
    const t = table();
    spawn(t.game, "Rinoa, Angel Wing");
    const flier = spawn(t.game, "Air Elemental");
    const walker = spawn(t.game, "Grizzly Bears");
    toStep(t.game, "begin-combat");
    settle(t.game);
    expect(pt(t.game, flier)).toEqual({ power: 5, toughness: 5 });
    expect(keywords(t.game, flier).has("vigilance")).toBe(true);
    expect(pt(t.game, walker)).toEqual({ power: 2, toughness: 2 });
    expect(keywords(t.game, walker).has("vigilance")).toBe(false);
  });
});
